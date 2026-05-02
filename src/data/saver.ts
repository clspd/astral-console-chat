import { writeFile } from 'node:fs/promises';
import type { Conversation } from '@/types/conversation.ts';

export async function saveConversation(path: string, conversation: Conversation): Promise<void> {
    conversation.stat.updated_at = Date.now();
    await writeFile(path, JSON.stringify(conversation, null, 2), 'utf-8');
}
