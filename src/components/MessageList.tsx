import React from 'react';
import { Box, Text } from 'ink';
import { useConversation } from '@/states/useConversation.ts';
import { MessageRole } from '@/types/conversation.js';

export default function MessageList() {
    const { conversation } = useConversation();
    const messages = conversation?.content.content ?? [];

    if (messages.length === 0) {
        return (
            <Box paddingY={1}>
                <Text dimColor>No messages yet. Start a conversation!</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" overflow="hidden">
            {messages.map((msg) => {
                const roleLabel = msg.role === MessageRole.User ? 'User' : 'Assistant';
                const roleColor = msg.role === MessageRole.User ? 'cyan' : 'green';
                const content = msg.fragments
                    .filter((f) => f.type === 'text')
                    .map((f) => f.content)
                    .join('');

                return (
                    <Box key={msg.id} paddingY={0}>
                        <Text>
                            <Text color={roleColor} bold>
                                {roleLabel}:{' '}
                            </Text>
                            <Text>{content}</Text>
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
}
