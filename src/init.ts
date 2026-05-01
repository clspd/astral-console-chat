import { initAppDir, checkVersion } from "@/data/dirs.ts";
import { conversationStore } from "./states/conversation.ts";
import { InitConversation } from "./data/loader.ts";

export async function init(values: Record<string, any>, positionals: string[]) {
    await initAppDir();
    await checkVersion();

    const input = positionals[0] ?? null;
    
    await InitConversation(input);
}

