import { initAppDir, checkVersion } from '@/data/dirs.ts';
import { initSettings } from '@/settings/index.ts';
import { initProviders } from '@/providers/store.ts';
import { InitConversation } from './data/loader.ts';
import { loadHistory } from '@/data/history.ts';
import { initMessageIds } from '@/chat/send.ts';
import { conversationStore } from '@/states/conversation.ts';

export async function init(positionals: string[]) {
    await initAppDir();
    await checkVersion();
    await initSettings();
    await initProviders();
    await loadHistory();

    const input = positionals[0] ?? null;
    await InitConversation(input);

    const { conversation } = conversationStore.getState();
    if (conversation) {
        initMessageIds(conversation);
    }
}
