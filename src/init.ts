import { initAppDir, checkVersion } from '@/data/dirs.ts';
import { initSettings } from '@/settings/index.ts';
import { InitConversation } from './data/loader.ts';

export async function init(positionals: string[]) {
    await initAppDir();
    await checkVersion();
    await initSettings();

    const input = positionals[0] ?? null;
    await InitConversation(input);
}
