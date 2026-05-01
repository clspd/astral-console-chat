import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Conversation } from '../types/conversation.js';
import { SchemaVersion } from '../types/conversation.js';
import { conversationStore } from '../state/conversation.js';
import { getChatsDir } from './dirs.js';

/** 从一个 JSON 文件读取并验证对话 */
function loadFromFile(filePath: string): Conversation {
  const raw = readFileSync(filePath, 'utf-8');
  const conv = JSON.parse(raw) as Conversation;

  // 验证 schemaVersion
  if (!conv.schemaVersion || !(conv.schemaVersion in SchemaVersion)) {
    throw new Error(
      `Unsupported schema version in "${filePath}": ${conv.schemaVersion}`,
    );
  }

  // 验证 appid
  if (!conv.appid || typeof conv.appid !== 'string') {
    throw new Error(`Missing or invalid appid in "${filePath}"`);
  }

  return conv;
}

/** 在 _chats/ 中创建一个空对话 */
function createEmptyConversation(): { conv: Conversation; path: string } {
  const id = randomUUID();
  const now = Date.now();

  const conv: Conversation = {
    schemaVersion: SchemaVersion.V1,
    appid: 'astral-console-chat',
    name: 'New Chat',
    stat: {
      created_at: now,
      updated_at: now,
    },
    history: [],
    content: {
      name: 'main',
      content: [],
    },
  };

  const path = join(getChatsDir(), `${id}.json`);
  writeFileSync(path, JSON.stringify(conv, null, 2), 'utf-8');

  return { conv, path };
}

/**
 * 初始化对话。
 *
 * 逻辑：
 * 1. 如果指定了 conversation 参数：
 *    a. 作为文件路径存在 → 加载，unsaved = false
 *    b. 在 _chats/${conversation}.json 存在 → 加载，unsaved = true
 *    c. 都不存在 → 报错退出
 * 2. 如果没有指定：
 *    → 在 _chats/ 中创建空对话，unsaved = true
 */
export function initConversation(rawInput: string | null): void {
  conversationStore.setState(s => ({
    ...s,
    rawInput,
    status: 'loading',
  }));

  // 情况 1：用户指定了 conversation
  if (rawInput) {
    // 1a：作为文件路径存在
    if (existsSync(rawInput)) {
      try {
        const conv = loadFromFile(rawInput);
        conversationStore.setState(s => ({
          ...s,
          conversation: conv,
          currentConversationPath: rawInput,
          unsaved: false,
          status: 'ready',
        }));
        return;
      } catch (err) {
        conversationStore.setState(s => ({
          ...s,
          status: 'error',
          error: `Failed to load conversation: ${err instanceof Error ? err.message : String(err)}`,
        }));
        throw err;
      }
    }

    // 1b：在 _chats/ 中存在
    // 如果 rawInput 是绝对路径则直接用，否则在 _chats/ 中查找
    const chatsPath = isAbsolute(rawInput)
      ? rawInput
      : join(getChatsDir(), `${rawInput}.json`);

    if (existsSync(chatsPath)) {
      try {
        const conv = loadFromFile(chatsPath);
        conversationStore.setState(s => ({
          ...s,
          conversation: conv,
          currentConversationPath: chatsPath,
          unsaved: true,
          status: 'ready',
        }));
        return;
      } catch (err) {
        conversationStore.setState(s => ({
          ...s,
          status: 'error',
          error: `Failed to load conversation: ${err instanceof Error ? err.message : String(err)}`,
        }));
        throw err;
      }
    }

    // 1c：都不存在
    const err = new Error(`Invalid conversation specifier: "${rawInput}"`);
    conversationStore.setState(s => ({
      ...s,
      status: 'error',
      error: err.message,
    }));
    throw err;
  }

  // 情况 2：没有指定 — 创建空对话
  const { conv, path } = createEmptyConversation();
  conversationStore.setState(s => ({
    ...s,
    conversation: conv,
    currentConversationPath: path,
    unsaved: true,
    status: 'ready',
  }));
}
