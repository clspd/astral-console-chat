import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Modal } from '@/utils/modal.tsx';
import { providerStore, setActiveModel, getActiveProvider } from '@/providers/store.ts';

export interface ModelSelectProps {
    open: boolean;
    onClose: () => void;
}

export default function ModelSelect({ open, onClose }: ModelSelectProps) {
    const storeSnapshot = providerStore.use((s) => s);
    const activeModelName = storeSnapshot.activeModelName;
    const activeProviderId = storeSnapshot.activeProviderId;
    const provider = activeProviderId ? getActiveProvider() : undefined;
    const models = provider?.models ?? [];
    const [selectedIndex, setSelectedIndex] = useState(0);

    useInput(
        (input, key) => {
            if (!open) return;

            if (key.escape) {
                onClose();
                return;
            }
            if (key.upArrow) {
                setSelectedIndex((p) => Math.max(0, p - 1));
                return;
            }
            if (key.downArrow) {
                setSelectedIndex((p) => Math.min(models.length - 1, p + 1));
                return;
            }
            if (key.return && models.length > 0) {
                const m = models[selectedIndex];
                if (m) {
                    setActiveModel(m.name);
                    onClose();
                }
                return;
            }
        },
        { isActive: open },
    );

    return (
        <Modal
            open={open}
            title="Select Model"
            onRequestClose={onClose}
            closeOnEscape={false}
            maxWidth={60}
        >
            <Box flexDirection="column">
                {!provider ? (
                    <Box marginBottom={1}>
                        <Text dimColor>
                            No provider is active. Use /provider to select one first.
                        </Text>
                    </Box>
                ) : models.length === 0 ? (
                    <Box marginBottom={1}>
                        <Text dimColor>
                            No models configured for "{provider.name}". Use /setup to add models.
                        </Text>
                    </Box>
                ) : (
                    models.map((m, i) => {
                        const isSel = i === selectedIndex;
                        return (
                            <Box key={m.name}>
                                <Text {...(isSel ? { color: 'cyan' } : {})}>
                                    {isSel ? '> ' : '  '}
                                    {m.display_name} ({m.name})
                                    {m.name === activeModelName ? ' [active]' : ''}
                                    {m.max_tokens ? ` - max ${m.max_tokens} tokens` : ''}
                                </Text>
                            </Box>
                        );
                    })
                )}
                <Box marginTop={1}>
                    <Text dimColor>[Enter] Select [Esc] Cancel</Text>
                </Box>
            </Box>
        </Modal>
    );
}
