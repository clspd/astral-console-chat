import type { Command, AppContext } from '../types.ts';
import { conversationStore } from '@/states/conversation.ts';
import { saveConversation } from '@/data/saver.ts';

export const renameCommand: Command = {
    name: 'rename',
    description: 'Rename conversation',
    description2: '[new name]',
    async execute(ctx: AppContext, rest: string) {
        const name = rest.trim();

        if (!name) {
            ctx.message.warning('Usage: /rename <new name>');
            return;
        }

        const { conversation, currentConversationPath } = conversationStore.getState();
        if (!conversation || !currentConversationPath) {
            ctx.message.warning('No active conversation');
            return;
        }

        conversation.name = name;
        await saveConversation(currentConversationPath, conversation);
        conversationStore.patch({ unsaved: false });

        ctx.message.success(`Conversation renamed to "${name}"`);
    },
};
