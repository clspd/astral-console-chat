import React, { useCallback, useState } from 'react';
import { Box, Text, useWindowSize, useApp } from 'ink';
import { useConversation } from '@/states/useConversation.ts';
import { app_name } from '@/config.ts';
import '@/commands/index.ts';
import { useCommandDispatch } from '@/commands/useCommandDispatch.ts';
import { AlertDialog } from '@/utils/modal.tsx';
import MessageList from '@/components/MessageList.tsx';
import UserInput from '@/components/UserInput.tsx';

export default function App() {
    const { conversation, status, error, unsaved } = useConversation();
    const { columns, rows } = useWindowSize();
    const [inputValue, setInputValue] = useState('');
    const { exit } = useApp();
    const { alert, setAlert, executeCommand } = useCommandDispatch(exit);

    const handleSubmit = useCallback(
        (value: string) => {
            setInputValue('');
            if (value[0] === '/') {
                executeCommand(value);
                return;
            }
        },
        [executeCommand],
    );

    if (status === 'loading') {
        return (
            <Box height={rows} paddingX={1} paddingY={1}>
                <Text>Loading...</Text>
            </Box>
        );
    }

    if (status === 'error') {
        return (
            <Box height={rows} paddingX={1} paddingY={1} flexDirection="column">
                <Text color="red">Error: {error}</Text>
            </Box>
        );
    }

    const sep = '─'.repeat(columns);

    return (
        <Box flexDirection="column" height={rows}>
            <Box paddingX={1}>
                <Text bold>
                    {conversation?.name ?? app_name}
                    {unsaved ? ' [unsaved]' : ''}
                </Text>
            </Box>

            <Box>
                <Text dimColor>{sep}</Text>
            </Box>

            <Box flexDirection="column" flexGrow={1} paddingX={1} overflow="visible">
                <MessageList />
            </Box>

            <Box flexDirection="column">
                <Box>
                    <Text dimColor>{sep}</Text>
                </Box>
                <UserInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
            </Box>

            <AlertDialog
                open={alert !== null}
                title={alert?.title ?? ''}
                description={alert?.description}
                onClose={() => setAlert(null)}
            />
        </Box>
    );
}
