import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { useConversation } from '@/states/useConversation.ts';
import { MessageRole, MessageStatus } from '@/types/conversation.js';

function estimateLines(text: string, width: number): number {
    let lines = 0;
    for (const ln of text.split('\n')) {
        lines += Math.max(1, Math.ceil([...ln].length / Math.max(1, width)));
    }
    return lines;
}

interface Props {
    columns: number;
    viewportHeight: number;
}

export default function MessageList({ columns, viewportHeight }: Props) {
    const { conversation, generating } = useConversation();
    const messages = conversation?.content.content ?? [];
    const [scrollOffset, setScrollOffset] = useState(0);
    const [started, setStarted] = useState(false);

    const { msgHeights, totalLines, maxScroll } = useMemo(() => {
        const h: number[] = [];
        for (const msg of messages) {
            const label =
                msg.role === MessageRole.User ? 'You' :
                msg.role === MessageRole.Assistant ? 'Assistant' :
                msg.role === MessageRole.System ? 'System' : msg.role;
            const text = msg.fragments
                .filter((f) => f.type === 'text')
                .map((f) => f.content)
                .join('');
            h.push(estimateLines(label + ': ' + text, columns - 2));
        }
        const total = h.reduce((a, b) => a + b, 0);
        return {
            msgHeights: h,
            totalLines: total,
            maxScroll: Math.max(0, total - viewportHeight),
        };
    }, [messages, columns, viewportHeight]);

    const clampedOffset = Math.max(0, Math.min(scrollOffset, maxScroll));

    useEffect(() => {
        if (messages.length > 0 && (!started || generating)) {
            setScrollOffset(maxScroll);
        }
        if (messages.length > 0) setStarted(true);
    }, [messages.length, generating, maxScroll, started]);

    useEffect(() => {
        if (scrollOffset > maxScroll) setScrollOffset(maxScroll);
    }, [maxScroll, scrollOffset]);

    const visibleMessages = useMemo(() => {
        if (maxScroll <= 0) return messages;
        const viewEnd = clampedOffset + viewportHeight;
        const result: typeof messages = [];
        let y = 0;
        for (let i = 0; i < messages.length; i++) {
            const h = msgHeights[i]!;
            if (y + h > clampedOffset && y < viewEnd) {
                result.push(messages[i]!);
            }
            y += h;
        }
        return result;
    }, [messages, msgHeights, clampedOffset, viewportHeight, maxScroll]);

    useInput(
        (_input, key) => {
            if (key.upArrow) {
                setScrollOffset((p) => Math.max(0, p - 1));
            } else if (key.downArrow) {
                setScrollOffset((p) => Math.min(maxScroll, p + 1));
            } else if (key.pageUp) {
                setScrollOffset((p) => Math.max(0, p - viewportHeight));
            } else if (key.pageDown) {
                setScrollOffset((p) => Math.min(maxScroll, p + viewportHeight));
            }
        },
        { isActive: maxScroll > 0 },
    );

    if (messages.length === 0 && !generating) {
        return (
            <Box paddingY={1}>
                <Text dimColor>No messages yet. Start a conversation!</Text>
            </Box>
        );
    }

    const roleLabel = (r: MessageRole) =>
        r === MessageRole.User ? 'You' :
        r === MessageRole.Assistant ? 'Assistant' :
        r === MessageRole.System ? 'System' : r;

    const roleColor = (r: MessageRole) =>
        r === MessageRole.User ? 'cyan' :
        r === MessageRole.Assistant ? 'green' : 'yellow';

    return (
        <Box flexDirection="column" height={viewportHeight} overflow="hidden">
            {visibleMessages.map((msg) => {
                const isWip = msg.status === MessageStatus.WIP;
                const isError = msg.status === MessageStatus.Error;
                const text = msg.fragments
                    .filter((f) => f.type === 'text')
                    .map((f) => f.content)
                    .join('');

                return (
                    <Box key={msg.id} paddingY={0}>
                        <Text>
                            <Text color={roleColor(msg.role)} bold>
                                {roleLabel(msg.role)}:{' '}
                            </Text>
                            {isWip && !text ? (
                                <Text dimColor>...</Text>
                            ) : isError ? (
                                <Text color="red">{text || 'Error'}</Text>
                            ) : (
                                <Text>{text}</Text>
                            )}
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
}
