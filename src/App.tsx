import React, { useCallback } from 'react';
import { Box, Text, useInput, useWindowSize } from 'ink';
import { useConversation } from './state/useConversation.js';
import { conversationStore } from './state/conversation.js';
import { MessageRole, MessageStatus } from './types/conversation.js';
import type { Message } from './types/conversation.js';
import MessageList from './ui/MessageList.js';
import InputBox from './ui/InputBox.js';

let nextMessageId = 1;

export default function App() {
  const { conversation, status, error, unsaved } = useConversation();
  const { columns, rows } = useWindowSize();

  const handleSubmit = useCallback((text: string) => {
    if (!conversation) return;

    const now = Date.now();
    const userMsg: Message = {
      id: nextMessageId++,
      parent_id: null,
      role: MessageRole.User,
      ts: now,
      status: MessageStatus.Finished,
      files: [],
      fragments: [
        {
          id: 1,
          type: 'text' as const,
          ts: now,
          contentType: 'text' as const,
          content: text,
        },
      ],
      has_pending_fragment: false,
    };

    const updatedConversation = {
      ...conversation,
      content: {
        ...conversation.content,
        content: [...conversation.content.content, userMsg],
      },
      stat: {
        ...conversation.stat,
        updated_at: now,
      },
    };

    conversationStore.setState(s => ({
      ...s,
      conversation: updatedConversation,
    }));
  }, [conversation]);

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
        <Text dimColor>Press ESC to exit</Text>
      </Box>
    );
  }

  const sep = '─'.repeat(columns);

  return (
    <Box flexDirection="column" height={rows}>
      {/* 标题栏 */}
      <Box paddingX={1}>
        <Text bold>
          {conversation?.name ?? 'Astral Console Chat'}
          {unsaved ? ' [unsaved]' : ''}
        </Text>
      </Box>

      <Box>
        <Text dimColor>{sep}</Text>
      </Box>

      {/* 消息列表 */}
      <Box flexDirection="column" flexGrow={1} paddingX={1} overflow="hidden">
        <MessageList />
      </Box>

      {/* 底部输入框 */}
      <Box flexDirection="column">
        <Box>
          <Text dimColor>{sep}</Text>
        </Box>
        <Box paddingX={1} paddingBottom={1}>
          <InputBox onSubmit={handleSubmit} />
        </Box>
      </Box>
    </Box>
  );
}
