import React, { useCallback, useState } from 'react';
import { Box, Text, useWindowSize, useApp } from 'ink';
import { useConversation } from '@/states/useConversation.ts';
import { app_name } from '@/config.ts';
import '@/commands/index.ts';
import { getCommand } from '@/commands/registry.ts';
import { useMessage } from '@/utils/message.tsx';
import MessageList from '@/components/MessageList.tsx';
import UserInput from '@/components/UserInput.tsx';

function extractCommandName(input: string): string {
  const spaceIndex = input.indexOf(' ');
  if (spaceIndex === -1) return input.slice(1);
  return input.slice(1, spaceIndex);
}

export default function App() {
    const { conversation, status, error, unsaved } = useConversation();
    const { columns, rows } = useWindowSize();
    const [inputValue, setInputValue] = useState('');
    const { exit } = useApp();
    const message = useMessage();

    const handleSubmit = useCallback(
        (value: string) => {
            const trimmed = value.trim();
            if (trimmed.length === 0) return;

            if (trimmed[0] === '/') {
                const cmdName = extractCommandName(trimmed);
                const cmd = getCommand(cmdName);
                if (cmd) {
                    cmd.execute({ exit });
                    return;
                }
                message.error(`Unknown command: /${cmdName}`);
                setInputValue('');
                return;
            }

            setInputValue('');
        },
        [exit, message],
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
                <UserInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                />
            </Box>
        </Box>
    );
}
