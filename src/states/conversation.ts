import type { Conversation } from '../types/conversation.ts';
import { createStore } from './store.ts';

export interface ConversationState {
    rawInput: string | null;
    currentConversationPath: string | null;
    unsaved: boolean;
    generating: boolean;
    conversation: Conversation | null;
    status: 'empty' | 'loading' | 'ready' | 'error';
    error: string | null;
}

export const defineConversationState = (c: ConversationState) => c;

export const conversationStore = createStore({
    state: () =>
        defineConversationState({
            rawInput: null,
            currentConversationPath: null,
            unsaved: false,
            generating: false,
            conversation: null,
            status: 'empty',
            error: null,
        }),
});
