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

export default function App() {
    const { conversation, status, error, unsaved } = useConversation();
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

            <ProviderConfig open={configOpen} onClose={() => setConfigOpen(false)} />
            <ProviderSelect
                open={providerSelectOpen}
                onClose={() => setProviderSelectOpen(false)}
            />
            <ModelSelect open={modelSelectOpen} onClose={() => setModelSelectOpen(false)} />
        </Box>
    );
}
