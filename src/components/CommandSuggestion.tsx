import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';
import { searchCommands, getAllCommands, getCommand } from '@/commands/registry.ts';
import { extractCommandName } from '@/commands/utils.ts';

const MAX_VISIBLE = 5;

interface CommandSuggestionProps {
    input: string;
    onAutocomplete: (value: string) => void;
    onActiveChange?: (active: boolean) => void;
    onExecute?: (commandText: string) => void;
}

export default function CommandSuggestion({
    input,
    onAutocomplete,
    onActiveChange,
    onExecute,
}: CommandSuggestionProps) {
    const isCommandMode = input.length > 0 && input[0] === '/';
    const hasSpace = input.indexOf(' ') !== -1;
    const commandName = isCommandMode ? extractCommandName(input) : '';
    const prefix = isCommandMode && !hasSpace ? input.slice(1) : '';

    const matchedCommand = useMemo(() => {
        if (!isCommandMode || !hasSpace) return undefined;
        return getCommand(commandName);
    }, [isCommandMode, hasSpace, commandName]);

    const matches = useMemo(() => {
        if (!isCommandMode) return [] as { name: string; description: string }[];
        if (hasSpace) return [];
        if (prefix === '') return getAllCommands();
        return searchCommands(prefix);
    }, [isCommandMode, hasSpace, prefix]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    const suggestionActive = isCommandMode && !hasSpace && matches.length > 0;

    useEffect(() => {
        onActiveChange?.(suggestionActive);
    }, [suggestionActive]);

    useEffect(() => {
        setSelectedIndex(0);
        setScrollOffset(0);
    }, [suggestionActive]);

    useEffect(() => {
        if (matches.length === 0) return;
        if (selectedIndex >= matches.length) {
            setSelectedIndex(0);
            setScrollOffset(0);
        }
    }, [matches.length, selectedIndex]);

    const matchesRef = useRef(matches);
    matchesRef.current = matches;
    const selectedIndexRef = useRef(selectedIndex);
    selectedIndexRef.current = selectedIndex;
    const scrollOffsetRef = useRef(scrollOffset);
    scrollOffsetRef.current = scrollOffset;
    const onAutocompleteRef = useRef(onAutocomplete);
    onAutocompleteRef.current = onAutocomplete;
    const onExecuteRef = useRef(onExecute);
    onExecuteRef.current = onExecute;

    const updateScroll = (newIdx: number, offset: number, total: number): number => {
        if (newIdx < offset) return newIdx;
        if (newIdx >= offset + MAX_VISIBLE) return newIdx - MAX_VISIBLE + 1;
        return offset;
    };

    useInput(
        (_input, key) => {
            const cmds = matchesRef.current;
            if (cmds.length === 0) return;

            if (key.return) {
                const idx = selectedIndexRef.current;
                const cmd = cmds[idx];
                if (cmd) {
                    onExecuteRef.current?.('/' + cmd.name + ' ');
                }
                return;
            }

            if (key.tab) {
                const idx = selectedIndexRef.current;
                const cmd = cmds[idx];
                if (cmd) {
                    onAutocompleteRef.current('/' + cmd.name + ' ');
                }
                return;
            }
            if (key.upArrow) {
                setSelectedIndex((prev) => {
                    const newIdx = (prev - 1 + cmds.length) % cmds.length;
                    setScrollOffset((off) => updateScroll(newIdx, off, cmds.length));
                    return newIdx;
                });
                return;
            }
            if (key.downArrow) {
                setSelectedIndex((prev) => {
                    const newIdx = (prev + 1) % cmds.length;
                    setScrollOffset((off) => updateScroll(newIdx, off, cmds.length));
                    return newIdx;
                });
                return;
            }
        },
        { isActive: suggestionActive },
    );

    if (hasSpace && matchedCommand) {
        return (
            <Box paddingX={1}>
                <Text dimColor>
                    /{matchedCommand.name}{' '}
                    {matchedCommand.description2 ?? matchedCommand.description}
                </Text>
            </Box>
        );
    }

    if (hasSpace && !matchedCommand) {
        return null;
    }

    if (matches.length === 0) return null;

    const visibleStart = scrollOffset;
    const visibleEnd = Math.min(matches.length, visibleStart + MAX_VISIBLE);
    const visibleMatches = matches.slice(visibleStart, visibleEnd);

    return (
        <Box flexDirection="column" paddingX={1}>
            {visibleMatches.map((cmd, i) => {
                const globalIdx = visibleStart + i;
                const isSelected = globalIdx === selectedIndex;
                return (
                    <Box key={cmd.name}>
                        {isSelected ? (
                            <Text color="cyan" bold>
                                {'  /' + cmd.name}
                            </Text>
                        ) : (
                            <Text>{'  /' + cmd.name}</Text>
                        )}
                        {cmd.description ? (
                            <Text dimColor={!isSelected}> — {cmd.description}</Text>
                        ) : null}
                    </Box>
                );
            })}
            {matches.length > MAX_VISIBLE ? (
                <Box>
                    <Text dimColor>
                        {visibleStart + 1}–{visibleEnd} of {matches.length}
                    </Text>
                </Box>
            ) : null}
        </Box>
    );
}
