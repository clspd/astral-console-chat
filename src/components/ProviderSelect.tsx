import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Modal } from '@/utils/modal.tsx';
import { providerStore, setActiveProvider } from '@/providers/store.ts';

export interface ProviderSelectProps {
    open: boolean;
    onClose: () => void;
}

export default function ProviderSelect({ open, onClose }: ProviderSelectProps) {
    const providers = providerStore.use((s) => s.providers);
    const activeProviderId = providerStore.use((s) => s.activeProviderId);
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
                setSelectedIndex((p) => Math.min(providers.length - 1, p + 1));
                return;
            }
            if (key.return && providers.length > 0) {
                const p = providers[selectedIndex];
                if (p) {
                    void setActiveProvider(p.id);
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
            title="Select Provider"
            onRequestClose={onClose}
            closeOnEscape={false}
            maxWidth={60}
        >
            <Box flexDirection="column">
                {providers.length === 0 ? (
                    <Box marginBottom={1}>
                        <Text dimColor>No providers configured. Use /setup to add one.</Text>
                    </Box>
                ) : (
                    providers.map((p, i) => {
                        const isSel = i === selectedIndex;
                        return (
                            <Box key={p.id}>
                                <Text {...(isSel ? { color: 'cyan' } : {})}>
                                    {isSel ? '> ' : '  '}
                                    {p.name}
                                    {p.id === activeProviderId ? ' [active]' : ''}
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
