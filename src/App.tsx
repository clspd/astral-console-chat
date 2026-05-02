import React, { useCallback, useEffect, useState } from 'react';
import { Box, Text, useWindowSize, useApp } from 'ink';
import { useConversation } from '@/states/useConversation.ts';
import { app_name } from '@/config.ts';
import '@/commands/index.ts';
import { useCommandDispatch } from '@/commands/useCommandDispatch.ts';
import { AlertDialog } from '@/utils/modal.tsx';
import { getActiveProvider } from '@/providers/store.ts';
import MessageList from '@/components/MessageList.tsx';
import UserInput from '@/components/UserInput.tsx';
import ProviderConfig from '@/components/ProviderConfig.tsx';
import ProviderSelect from '@/components/ProviderSelect.tsx';
import ModelSelect from '@/components/ModelSelect.tsx';
import { shouldOpenConfigOnStart } from './main.tsx';
import { addHistory, endNavigation } from '@/data/history.ts';
import { sendMessage } from '@/chat/send.ts';

export default function App() {
    const { conversation, status, error, unsaved, generating } = useConversation();
    const { columns, rows } = useWindowSize();
    const [inputValue, setInputValue] = useState('');
    const { exit } = useApp();

    const [configOpen, setConfigOpen] = useState(false);
    const [providerSelectOpen, setProviderSelectOpen] = useState(false);
    const [modelSelectOpen, setModelSelectOpen] = useState(false);

    useEffect(() => {
        if (shouldOpenConfigOnStart()) {
            setConfigOpen(true);
        }
    }, []);

    const showConfig = useCallback(() => setConfigOpen(true), []);
    const showProviderSelect = useCallback(() => setProviderSelectOpen(true), []);
    const showModelSelect = useCallback(() => {
        const provider = getActiveProvider();
        if (!provider) {
            setConfigOpen(true);
        } else {
            setModelSelectOpen(true);
        }
    }, []);

    const { alert, setAlert, executeCommand } = useCommandDispatch(
        exit,
        showConfig,
        showProviderSelect,
        showModelSelect,
    );

    const handleSubmit = useCallback(
        (value: string) => {
            if (generating) return;
            if (value.trim() === '') {
                setInputValue('');
                return;
            }
            addHistory(value);
            endNavigation();
            setInputValue('');
            if (value[0] === '/') {
                void executeCommand(value);
                return;
            }
            void sendMessage(value);
        },
        [executeCommand, generating],
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
    const maxInputHeight = Math.max(1, Math.floor(rows / 2) - 1);
    const msgHeight = Math.max(3, rows - 4 - maxInputHeight - 1);

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

            <Box paddingX={1} height={msgHeight} overflow="hidden">
                <MessageList columns={columns} viewportHeight={msgHeight} />
            </Box>

            <Box flexDirection="column" flexShrink={0}>
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

            <ProviderConfig open={configOpen} onClose={() => setConfigOpen(false)} />
            <ProviderSelect
                open={providerSelectOpen}
                onClose={() => setProviderSelectOpen(false)}
            />
            <ModelSelect open={modelSelectOpen} onClose={() => setModelSelectOpen(false)} />
        </Box>
    );
}
