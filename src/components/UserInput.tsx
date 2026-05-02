import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Text, useInput, useWindowSize } from 'ink';
import { useModalActive } from '@/utils/modal.tsx';
import CommandSuggestion from './CommandSuggestion.tsx';
import { navigateUp, navigateDown } from '@/data/history.ts';

interface UserInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}

function codePointLen(str: string): number {
    return [...str].length;
}

function codePointAt(str: string, idx: number): string {
    return [...str][idx] ?? '';
}

function codePointSlice(str: string, start: number, end?: number): string {
    return [...str].slice(start, end).join('');
}

function CustomTextInput({
    value,
    onChange,
    onSubmit,
    maxHeight,
    suggestionActive = false,
}: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    maxHeight: number;
    suggestionActive?: boolean;
}) {
    const [cursorOffset, setCursorOffset] = useState(0);
    const [scrollLine, setScrollLine] = useState(0);
    const modalActive = useModalActive();

    const cursorRef = useRef(cursorOffset);
    cursorRef.current = cursorOffset;
    const valueRef = useRef(value);
    valueRef.current = value;
    const prevValueRef = useRef(value);
    const scrollRef = useRef(scrollLine);
    scrollRef.current = scrollLine;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;
    const internalChangeRef = useRef(false);
    const suggestionActiveRef = useRef(suggestionActive);
    suggestionActiveRef.current = suggestionActive;

    const clamp = useCallback((off: number, val: string) => {
        const max = codePointLen(val);
        if (off < 0) return 0;
        if (off > max) return max;
        return off;
    }, []);

    const getLineOfOffset = useCallback((off: number, val: string): number => {
        let line = 0;
        for (let i = 0; i < off && i < val.length; i++) {
            if (val[i] === '\n') line++;
        }
        return line;
    }, []);

    const ensureCursorVisible = useCallback(
        (off: number, val: string, scroll: number, mh: number): number => {
            const cursorLine = getLineOfOffset(off, val);
            if (cursorLine < scroll) return cursorLine;
            if (cursorLine >= scroll + mh) return cursorLine - mh + 1;
            return scroll;
        },
        [getLineOfOffset],
    );

    useEffect(() => {
        const prev = prevValueRef.current;
        const cur = value;
        prevValueRef.current = cur;

        if (!internalChangeRef.current && cur !== prev && cur.startsWith(prev)) {
            const newCur = codePointLen(cur);
            setCursorOffset(newCur);
            setScrollLine(ensureCursorVisible(newCur, cur, scrollRef.current, maxHeight));
        }
        internalChangeRef.current = false;
    });

    useEffect(() => {
        const val = valueRef.current;
        const cur = cursorRef.current;
        const mh = maxHeight;
        const newScroll = ensureCursorVisible(cur, val, scrollRef.current, mh);
        if (newScroll !== scrollRef.current) {
            setScrollLine(newScroll);
        }
    });

    useInput(
        (input, key) => {
            const val = valueRef.current;
            const cur = cursorRef.current;
            const mh = maxHeight;

            if (key.return && (key.ctrl || key.shift)) {
                internalChangeRef.current = true;
                const before = codePointSlice(val, 0, cur);
                const after = codePointSlice(val, cur);
                const newVal = before + '\n' + after;
                const newCur = clamp(cur + 1, newVal);
                onChangeRef.current(newVal);
                setCursorOffset(newCur);
                setScrollLine(ensureCursorVisible(newCur, newVal, scrollRef.current, mh));
                return;
            }

            if (key.return) {
                if (suggestionActiveRef.current) return;
                onSubmitRef.current(val);
                return;
            }

            if (key.tab) {
                return;
            }

            if (key.backspace || key.delete) {
                internalChangeRef.current = true;
                if (key.backspace) {
                    if (cur === 0) return;
                    const before = codePointSlice(val, 0, cur - 1);
                    const after = codePointSlice(val, cur);
                    const newVal = before + after;
                    const newCur = clamp(cur - 1, newVal);
                    onChangeRef.current(newVal);
                    setCursorOffset(newCur);
                    setScrollLine(ensureCursorVisible(newCur, newVal, scrollRef.current, mh));
                } else {
                    if (cur >= codePointLen(val)) return;
                    const before = codePointSlice(val, 0, cur);
                    const after = codePointSlice(val, cur + 1);
                    const newVal = before + after;
                    const newCur = clamp(cur, newVal);
                    onChangeRef.current(newVal);
                    setCursorOffset(newCur);
                    setScrollLine(ensureCursorVisible(newCur, newVal, scrollRef.current, mh));
                }
                return;
            }

            if (key.leftArrow) {
                if (key.ctrl) {
                    let nc = cur - 1;
                    while (nc > 0) {
                        const ch = codePointAt(val, nc - 1);
                        if (ch === ' ' || ch === '\n') break;
                        nc--;
                    }
                    setCursorOffset(clamp(nc, val));
                    setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                } else {
                    const nc = clamp(cur - 1, val);
                    setCursorOffset(nc);
                    setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                }
                return;
            }

            if (key.rightArrow) {
                if (key.ctrl) {
                    const max = codePointLen(val);
                    let nc = cur + 1;
                    while (nc < max) {
                        const ch = codePointAt(val, nc);
                        if (ch === ' ' || ch === '\n') break;
                        nc++;
                    }
                    setCursorOffset(clamp(nc, val));
                    setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                } else {
                    const nc = clamp(cur + 1, val);
                    setCursorOffset(nc);
                    setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                }
                return;
            }

            if (key.upArrow) {
                if (suggestionActiveRef.current) return;

                const lineStart = val.lastIndexOf('\n', cur - 1);
                if (lineStart === -1) {
                    const entry = navigateUp(val);
                    if (entry !== null) {
                        internalChangeRef.current = true;
                        onChangeRef.current(entry);
                        const newCur = codePointLen(entry);
                        setCursorOffset(newCur);
                        setScrollLine(ensureCursorVisible(newCur, entry, scrollRef.current, mh));
                    }
                    return;
                }

                const col = cur - (lineStart + 1);
                const prevLineStart = val.lastIndexOf('\n', lineStart - 1);
                const prevLineLen = lineStart - prevLineStart - 1;
                const nc = clamp(prevLineStart + 1 + Math.min(col, prevLineLen), val);
                setCursorOffset(nc);
                setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                return;
            }

            if (key.downArrow) {
                if (suggestionActiveRef.current) return;

                const nextLineEnd = val.indexOf('\n', cur);
                if (nextLineEnd === -1) {
                    const entry = navigateDown();
                    if (entry !== null) {
                        internalChangeRef.current = true;
                        onChangeRef.current(entry);
                        const newCur = codePointLen(entry);
                        setCursorOffset(newCur);
                        setScrollLine(ensureCursorVisible(newCur, entry, scrollRef.current, mh));
                    }
                    return;
                }

                const lineStart = val.lastIndexOf('\n', cur - 1);
                const col = cur - (lineStart + 1);
                const nextNextNewline = val.indexOf('\n', nextLineEnd + 1);
                const nextLineLen =
                    nextNextNewline === -1
                        ? val.length - nextLineEnd - 1
                        : nextNextNewline - nextLineEnd - 1;
                const nc = clamp(nextLineEnd + 1 + Math.min(col, nextLineLen), val);
                setCursorOffset(nc);
                setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                return;
            }

            if (key.home) {
                const lineStart = val.lastIndexOf('\n', cur - 1);
                const nc = lineStart + 1;
                setCursorOffset(nc);
                setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                return;
            }

            if (key.end) {
                const lineEnd = val.indexOf('\n', cur);
                const nc = lineEnd === -1 ? codePointLen(val) : lineEnd;
                setCursorOffset(nc);
                setScrollLine(ensureCursorVisible(nc, val, scrollRef.current, mh));
                return;
            }

            if (input) {
                internalChangeRef.current = true;
                const before = codePointSlice(val, 0, cur);
                const after = codePointSlice(val, cur);
                const newVal = before + input + after;
                const newCur = clamp(cur + codePointLen(input), newVal);
                onChangeRef.current(newVal);
                setCursorOffset(newCur);
                setScrollLine(ensureCursorVisible(newCur, newVal, scrollRef.current, mh));
                return;
            }
        },
        { isActive: !modalActive },
    );

    const lines = value.split('\n');
    const totalLines = lines.length;
    const visibleStart = scrollLine;
    const visibleEnd = Math.min(totalLines, visibleStart + maxHeight);
    const visibleLines: string[] = [];
    for (let i = visibleStart; i < visibleEnd; i++) {
        visibleLines.push(lines[i] ?? '');
    }
    const showTopDots = visibleStart > 0;
    const showBottomDots = visibleEnd < totalLines;

    const actualHeight = Math.min(totalLines, maxHeight);

    return (
        <Box flexDirection="column" height={actualHeight}>
            {showTopDots && <Text dimColor>...</Text>}
            {visibleLines.map((line, lineIdx) => {
                const actualLineIdx = visibleStart + lineIdx;
                let lineStartInValue = 0;
                for (let i = 0; i < actualLineIdx; i++) {
                    lineStartInValue += (lines[i]?.length ?? 0) + 1;
                }

                const isCurrentLine =
                    cursorOffset >= lineStartInValue &&
                    cursorOffset <= lineStartInValue + line.length;

                return (
                    <Box key={lineIdx} flexDirection="row">
                        {isCurrentLine ? (
                            <RenderLineWithCursor
                                line={line}
                                cursorCol={cursorOffset - lineStartInValue}
                            />
                        ) : (
                            <Text>{line || ' '}</Text>
                        )}
                    </Box>
                );
            })}
            {showBottomDots && <Text dimColor>...</Text>}
        </Box>
    );
}

function RenderLineWithCursor({ line, cursorCol }: { line: string; cursorCol: number }) {
    const chars = [...line];
    if (chars.length === 0) {
        return (
            <Text>
                <Text backgroundColor="cyan"> </Text>
            </Text>
        );
    }

    return (
        <Text>
            {chars.map((ch, i) => {
                if (i === cursorCol) {
                    return (
                        <Text key={i} backgroundColor="cyan">
                            {ch}
                        </Text>
                    );
                }
                return <Text key={i}>{ch}</Text>;
            })}
            {cursorCol >= chars.length && <Text key={chars.length} backgroundColor="cyan"> </Text>}
        </Text>
    );
}

export default function UserInput({ value, onChange, onSubmit }: UserInputProps) {
    const { rows } = useWindowSize();
    const maxInputHeight = Math.max(1, Math.floor(rows / 2) - 1);
    const [suggestionActive, setSuggestionActive] = useState(false);

    const handleAutocomplete = useCallback(
        (newValue: string) => {
            onChange(newValue);
        },
        [onChange],
    );

    const handleExecute = useCallback(
        (commandText: string) => {
            onChange(commandText);
            onSubmit(commandText);
        },
        [onChange, onSubmit],
    );

    return (
        <Box flexDirection="column">
            <CommandSuggestion
                input={value}
                onAutocomplete={handleAutocomplete}
                onActiveChange={setSuggestionActive}
                onExecute={handleExecute}
            />
            <Box paddingX={1}>
                <Text color="cyan" bold>
                    {'>'}{' '}
                </Text>
                <CustomTextInput
                    value={value}
                    onChange={onChange}
                    onSubmit={onSubmit}
                    maxHeight={maxInputHeight}
                    suggestionActive={suggestionActive}
                />
            </Box>
        </Box>
    );
}
