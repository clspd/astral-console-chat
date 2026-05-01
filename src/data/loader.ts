import { readFile, writeFile } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { appid } from '@/config.ts';
import { exists } from '@/utils/fsutil.ts';

import type { Conversation } from '../types/conversation.js';
import { SchemaVersion } from '../types/conversation.js';
import { conversationStore } from '../states/conversation.ts';
import { getChatsDir } from './dirs.js';

async function LoadConversationFromFile(filePath: string): Promise<Conversation> {
    const raw = await readFile(filePath, 'utf-8');
    const conv = JSON.parse(raw) as Conversation;

    if (!conv.appid || typeof conv.appid !== 'string') {
        throw new TypeError(`Missing or invalid appid in "${filePath}"`);
    }

    if (conv.appid !== appid) {
        throw new TypeError(`Invalid application identifier`);
    }

    if (!conv.schemaVersion || !(conv.schemaVersion in SchemaVersion)) {
        throw new TypeError(`Unsupported schema version in "${filePath}": ${conv.schemaVersion}`);
    }

    return conv;
}

async function CreateEmptyConversation(): Promise<{ conv: Conversation; path: string }> {
    const id = randomUUID();
    const now = Date.now();

    const conv: Conversation = {
        schemaVersion: SchemaVersion.V1,
        appid,
        name: 'New Chat',
        stat: {
            created_at: now,
            updated_at: now,
        },
        history: [],
        content: {
            name: 'New Topic',
            content: [],
        },
    };

    const path = join(getChatsDir(), `${id}.json`);
    await writeFile(path, JSON.stringify(conv, null, 2), 'utf-8');

    return { conv, path };
}

export async function InitConversation(rawInput: string | null): Promise<void> {
    conversationStore.patch({
        rawInput,
        status: 'loading',
    });

    // if the user specified a conversation
    if (rawInput) {
        // if the input is a file path
        if (await exists(rawInput)) {
            try {
                const conv = await LoadConversationFromFile(rawInput);
                conversationStore.patch({
                    conversation: conv,
                    currentConversationPath: rawInput,
                    unsaved: false,
                    status: 'ready',
                });
                return;
            } catch (err) {
                conversationStore.patch({
                    status: 'error',
                    error: `Failed to load conversation: ${String(err)}`,
                });
                throw err;
            }
        }

        // 1b：在 _chats/ 中存在
        // 如果 rawInput 是绝对路径则直接用，否则在 _chats/ 中查找
        const chatsPath = isAbsolute(rawInput) ? rawInput : join(getChatsDir(), `${rawInput}.json`);

        if (await exists(chatsPath)) {
            try {
                const conv = await LoadConversationFromFile(chatsPath);
                conversationStore.patch({
                    conversation: conv,
                    currentConversationPath: chatsPath,
                    unsaved: true,
                    status: 'ready',
                });
                return;
            } catch (err) {
                conversationStore.patch({
                    status: 'error',
                    error: `Failed to load conversation: ${String(err)}`,
                });
                throw err;
            }
        }

        // Neither file path nor _chats/ path exists
        const err = new Error(`Invalid conversation specifier: "${rawInput}"`);
        conversationStore.patch({
            status: 'error',
            error: String(err),
        });
        throw err;
    }

    // If the input is not specified, create a new conversation
    const { conv, path } = await CreateEmptyConversation();
    conversationStore.patch({
        conversation: conv,
        currentConversationPath: path,
        unsaved: true,
        status: 'ready',
    });
}
