import React, { useCallback, useState } from 'react';
import { Box, Text, useApp, useInput, useWindowSize } from 'ink';
import { TraceErrorAndGetString } from '@/utils/errorTrace.ts';
import { sendReport } from '@/utils/sendReport.ts';

export default function FatalErrorView({ error }: { error: unknown }) {
    const { exit } = useApp();
    const { columns, rows } = useWindowSize();
    const [state, setState] = useState<'prompt' | 'sending' | 'sent' | 'error'>('prompt');
    const [focused, setFocused] = useState<'send' | 'exit'>('send');
    const [sendError, setSendError] = useState<string | null>(null);

    const errorText = TraceErrorAndGetString(error);

    const handleSend = useCallback(async () => {
        setState('sending');
        try {
            await sendReport(errorText);
            setState('sent');
        } catch (e) {
            setSendError(String(e));
            setState('error');
        }
    }, [errorText]);

    const handleExit = useCallback(() => {
        exit();
    }, [exit]);

    useInput(
        (_input, key) => {
            if (state === 'sending') return;

            if (key.escape) {
                exit();
                return;
            }

            if (state === 'sent' || state === 'error') {
                if (key.return) exit();
                return;
            }

            if (key.leftArrow || key.rightArrow || key.tab) {
                setFocused((f) => (f === 'send' ? 'exit' : 'send'));
                return;
            }

            if (key.return) {
                if (focused === 'send') {
                    void handleSend();
                } else {
                    handleExit();
                }
            }
        },
        { isActive: true },
    );

    const maxWidth = Math.min(76, columns - 4);
    const maxErrorHeight = Math.max(6, rows - 14);

    const errorLines = errorText.split('\n');
    const needsTruncation = errorLines.length > maxErrorHeight;
    const displayLines = needsTruncation ? errorLines.slice(0, maxErrorHeight) : errorLines;

    return (
        <Box flexDirection="column" height={rows} paddingX={1} paddingY={1}>
            <Box marginBottom={1}>
                <Text bold color="red">
                    Fatal Error
                </Text>
            </Box>

            <Box marginBottom={1}>
                <Text dimColor>{'─'.repeat(maxWidth)}</Text>
            </Box>

            <Box
                flexDirection="column"
                height={maxErrorHeight}
                overflow="hidden"
                marginBottom={1}
                borderStyle="single"
                paddingX={1}
            >
                {displayLines.map((line, i) => (
                    <Text key={i} dimColor>
                        {line || ' '}
                    </Text>
                ))}
                {needsTruncation ? (
                    <Text dimColor>...({errorLines.length - maxErrorHeight} more lines)</Text>
                ) : null}
            </Box>

            <Box marginBottom={1}>
                <Text dimColor>{'─'.repeat(maxWidth)}</Text>
            </Box>

            {state === 'prompt' ? (
                <Box flexDirection="column">
                    <Box marginBottom={1}>
                        <Text>Would you like to send an error report?</Text>
                    </Box>

                    <Box flexDirection="row">
                        <Box paddingX={1} marginRight={1}>
                            <Text
                                bold={focused === 'send'}
                                color={focused === 'send' ? 'blue' : 'white'}
                            >
                                Send Report
                            </Text>
                        </Box>
                        <Box paddingX={1}>
                            <Text
                                bold={focused === 'exit'}
                                color={focused === 'exit' ? 'blue' : 'white'}
                            >
                                Exit
                            </Text>
                        </Box>
                    </Box>

                    <Box marginTop={1}>
                        <Text dimColor>Tab/Arrows to switch · Enter to confirm · Esc to exit</Text>
                    </Box>
                </Box>
            ) : null}

            {state === 'sending' ? (
                <Box>
                    <Text color="yellow">Sending error report...</Text>
                </Box>
            ) : null}

            {state === 'sent' ? (
                <Box flexDirection="column">
                    <Box marginBottom={1}>
                        <Text color="green">Report sent. Thank you!</Text>
                    </Box>
                    <Box borderStyle="round" paddingX={1} width={12}>
                        <Text bold>Exit</Text>
                    </Box>
                    <Box marginTop={1}>
                        <Text dimColor>Enter to exit</Text>
                    </Box>
                </Box>
            ) : null}

            {state === 'error' ? (
                <Box flexDirection="column">
                    <Box marginBottom={1}>
                        <Text color="red">Failed to send report: {sendError}</Text>
                    </Box>
                    <Box borderStyle="round" paddingX={1} width={12}>
                        <Text bold>Exit</Text>
                    </Box>
                    <Box marginTop={1}>
                        <Text dimColor>Enter to exit</Text>
                    </Box>
                </Box>
            ) : null}
        </Box>
    );
}
