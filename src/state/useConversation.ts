import { useSyncExternalStore } from 'react';
import { conversationStore } from './conversation.js';

export function useConversation() {
  return useSyncExternalStore(
    conversationStore.subscribe,
    conversationStore.getState,
  );
}
