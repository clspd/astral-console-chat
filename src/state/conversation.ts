import type { Conversation } from '../types/conversation.js';
import { createStore } from './store.js';

export type ConversationState = {
  /** 命令行传进来的原始值 */
  rawInput: string | null;
  /** 当前对话文件在磁盘上的路径 */
  currentConversationPath: string | null;
  /** 是否未保存（在 _chats/ 中的临时对话） */
  unsaved: boolean;
  /** 加载完成的对话 */
  conversation: Conversation | null;
  /** 加载状态 */
  status: 'empty' | 'loading' | 'ready' | 'error';
  /** 错误信息 */
  error: string | null;
};

export const conversationStore = createStore<ConversationState>({
  rawInput: null,
  currentConversationPath: null,
  unsaved: false,
  conversation: null,
  status: 'empty',
  error: null,
});
