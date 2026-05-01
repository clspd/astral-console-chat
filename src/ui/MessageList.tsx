import React from 'react';
import { Box, Text } from 'ink';
import { useConversation } from '../state/useConversation.js';
import { MessageRole, MessageStatus } from '../types/conversation.js';

const ROLE_LABEL: Record<MessageRole, string> = {
  [MessageRole.User]: 'You',
  [MessageRole.Assistant]: 'Assistant',
  [MessageRole.System]: 'System',
  [MessageRole.Tool]: 'Tool',
  [MessageRole.ToolResult]: 'Tool',
};

const ROLE_COLOR: Record<MessageRole, string> = {
  [MessageRole.User]: 'cyan',
  [MessageRole.Assistant]: 'green',
  [MessageRole.System]: 'yellow',
  [MessageRole.Tool]: 'magenta',
  [MessageRole.ToolResult]: 'magenta',
};

function getTextContent(message: import('../types/conversation.js').Message): string {
  return message.fragments
    .filter(f => f.contentType === 'text' as const)
    .map(f => f.content as string)
    .join('');
}

export default function MessageList() {
  const { conversation, status } = useConversation();

  if (status !== 'ready' || !conversation) {
    return (
      <Box flexDirection="column">
        <Text dimColor>No messages yet.</Text>
      </Box>
    );
  }

  const messages = conversation.content.content;

  if (messages.length === 0) {
    return (
      <Box flexDirection="column">
        <Text dimColor>Start a conversation — type a message below.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {messages.map(msg => {
        const label = ROLE_LABEL[msg.role] ?? msg.role;
        const color = ROLE_COLOR[msg.role] ?? 'white';
        const text = getTextContent(msg);
        const isWip = msg.status === MessageStatus.WIP;
        const isError = msg.status === MessageStatus.Error;

        return (
          <Box key={msg.id} flexDirection="column" marginBottom={1}>
            <Text color={color} bold>
              {label}
              {isWip ? ' ...' : ''}
              {isError ? ' (error)' : ''}
            </Text>
            <Text>{text}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
