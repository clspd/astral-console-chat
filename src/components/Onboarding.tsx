import React, { useCallback, useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

export interface OnboardingProps {
    onConfigure: () => void;
    onSkip: () => void;
}

export default function Onboarding({ onConfigure, onSkip }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const { exit } = useApp();

    const handleConfigure = useCallback(() => {
        onConfigure();
        exit();
    }, [onConfigure, exit]);

    const handleSkip = useCallback(() => {
        onSkip();
        exit();
    }, [onSkip, exit]);

    useInput((input, key) => {
        if (key.escape) {
            handleSkip();
            return;
        }

        if (step === 0) {
            if (key.return) {
                setStep(1);
                return;
            }
            if (input === 'c') {
                handleConfigure();
                return;
            }
            if (input === 's') {
                handleSkip();
                return;
            }
            return;
        }

        if (step === 1) {
            if (key.return) {
                handleConfigure();
                return;
            }
            if (input === 's') {
                handleSkip();
                return;
            }
            if (input === 'b') {
                setStep(0);
                return;
            }
            return;
        }
    });

    return (
        <Box flexDirection="column" padding={2}>
            <Box marginBottom={1}>
                <Text bold>Welcome to Astral Console Chat</Text>
            </Box>

            {step === 0 ? (
                <Box flexDirection="column">
                    <Box marginBottom={1}>
                        <Text>A terminal-based AI chat client.</Text>
                    </Box>
                    <Box marginBottom={1}>
                        <Text>
                            To get started, you need to configure an AI provider (OpenAI-compatible
                            API). You can also skip this and configure later using the /setup
                            command.
                        </Text>
                    </Box>
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>[Enter] Next [c] Configure Now [s] Skip [Esc] Skip</Text>
                    </Box>
                </Box>
            ) : (
                <Box flexDirection="column">
                    <Box marginBottom={1}>
                        <Text>You'll need:</Text>
                    </Box>
                    <Box marginBottom={1}>
                        <Text>1. A provider name (e.g. "OpenAI", "DeepSeek")</Text>
                    </Box>
                    <Box marginBottom={1}>
                        <Text>2. A Base URL (e.g. https://api.openai.com/v1)</Text>
                    </Box>
                    <Box marginBottom={1}>
                        <Text>3. An API Key for authentication</Text>
                    </Box>
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>[Enter] Configure [b] Back [s] Skip [Esc] Skip</Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
