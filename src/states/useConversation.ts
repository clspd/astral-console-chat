import { useSyncExternalStore } from 'react';
import { conversationStore } from './conversation.ts';

export function useConversation() {
    return useSyncExternalStore(
        conversationStore.subscribe,
        conversationStore.getState,
    );
}
