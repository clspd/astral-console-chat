import { streamText, NoOutputGeneratedError, APICallError } from 'ai';
import { conversationStore } from '@/states/conversation.ts';
import {
    MessageRole,
    MessageStatus,
    MessageFragmentType,
    MessageContentType,
} from '@/types/conversation.ts';
import type { Message, MessageFragment, Conversation } from '@/types/conversation.ts';
import { saveConversation } from '@/data/saver.ts';
import { TraceErrorAndGetString } from '@/utils/errorTrace.ts';
import { getLanguageModel } from './llm.ts';

let _nextId = 1;

export function initMessageIds(conversation: Conversation): void {
    let maxId = 0;
    for (const container of [conversation.content, ...conversation.history]) {
        for (const msg of container.content) {
            if (msg.id > maxId) maxId = msg.id;
            for (const frag of msg.fragments) {
                if (frag.id > maxId) maxId = frag.id;
            }
        }
    }
    _nextId = maxId + 1;
}

function nextId(): number {
    return _nextId++;
}

function createMessage(
    role: MessageRole,
    status: MessageStatus,
    parentId: number | null = null,
): Message {
    return {
        id: nextId(),
        parent_id: parentId,
        role,
        ts: Date.now(),
        status,
        files: [],
        fragments: [],
        has_pending_fragment: false,
    };
}

function textFragment(content: string): MessageFragment {
    return {
        id: nextId(),
        type: MessageFragmentType.TextFragment,
        ts: Date.now(),
        contentType: MessageContentType.Text,
        content,
    };
}

function buildMessages(conversation: Conversation, newUserInput: string) {
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

    for (const msg of conversation.content.content) {
        if (msg.status !== MessageStatus.Finished) continue;
        const text = msg.fragments
            .filter((f) => f.type === MessageFragmentType.TextFragment)
            .map((f) => f.content)
            .join('');
        if (!text) continue;

        const role =
            msg.role === MessageRole.User
                ? 'user'
                : msg.role === MessageRole.Assistant
                  ? 'assistant'
                  : msg.role === MessageRole.System
                    ? 'system'
                    : 'user';

        messages.push({ role: role as 'system' | 'user' | 'assistant', content: text });
    }

    messages.push({ role: 'user', content: newUserInput });
    return messages;
}

function formatError(err: unknown): string {
    if (err instanceof APICallError) {
        let msg = `HTTP ${err.statusCode ?? '?'}: ${err.message}`;
        if (err.responseBody) {
            msg += `\nResponse: ${JSON.stringify(err.responseBody)}`;
        }
        if (err.cause) msg += `\nCause: ${formatError(err.cause)}`;
        return msg;
    }
    if (err instanceof NoOutputGeneratedError) {
        let msg = `${err.name}: ${err.message}`;
        if (err.cause) msg += `\nCause: ${formatError(err.cause)}`;
        return msg;
    }
    return TraceErrorAndGetString(err);
}

export async function sendMessage(userInput: string): Promise<void> {
    const { conversation, currentConversationPath, generating } = conversationStore.getState();
    if (!conversation || !currentConversationPath || generating) return;

    const model = getLanguageModel();
    if (!model) {
        const errMsg = createMessage(MessageRole.Assistant, MessageStatus.Error);
        errMsg.fragments.push(
            textFragment('No AI provider configured. Use /setup to add a provider.'),
        );
        conversation.content.content.push(errMsg);
        await saveConversation(currentConversationPath, conversation);
        conversationStore.patch({ unsaved: false });
        return;
    }

    const userMsg = createMessage(MessageRole.User, MessageStatus.Finished);
    userMsg.fragments.push(textFragment(userInput));

    const assistantMsg = createMessage(MessageRole.Assistant, MessageStatus.WIP, userMsg.id);
    const streamFragment: MessageFragment = {
        id: nextId(),
        type: MessageFragmentType.TextFragment,
        ts: Date.now(),
        contentType: MessageContentType.Text,
        content: '',
    };
    assistantMsg.fragments.push(streamFragment);
    assistantMsg.has_pending_fragment = true;

    conversation.content.content.push(userMsg, assistantMsg);
    conversationStore.patch({ generating: true, unsaved: true });

    try {
        const messages = buildMessages(conversation, userInput);

        const streamErrors: unknown[] = [];
        const result = streamText({
            model,
            messages,
            onError: ({ error }) => {
                streamErrors.push(error);
            },
        });

        let lastFlush = 0;
        let lastSave = Date.now();
        for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
                streamFragment.content += part.text;
            } else if (part.type === 'error') {
                streamErrors.push(part.error);
            }

            const now = Date.now();
            if (now - lastFlush > 33) {
                lastFlush = now;
                conversationStore.patch({});
            }
            if (now - lastSave > 1000) {
                lastSave = now;
                await saveConversation(currentConversationPath, conversation);
            }
        }

        if (!streamFragment.content && streamErrors.length > 0) {
            assistantMsg.status = MessageStatus.Error;
            streamFragment.content = streamErrors.map(formatError).join('\n');
        } else {
            assistantMsg.status = MessageStatus.Finished;
            assistantMsg.has_pending_fragment = false;

            const usage = await result.usage;
            if (usage) {
                assistantMsg.usage = { total_tokens: usage.totalTokens ?? 0 };
            }
        }

        await saveConversation(currentConversationPath, conversation);
        conversationStore.patch({ generating: false, unsaved: false });
    } catch (err) {
        assistantMsg.status = MessageStatus.Error;
        const details = formatError(err);
        if (!streamFragment.content) {
            streamFragment.content = details;
        } else {
            streamFragment.content += `\n\n${details}`;
        }
        await saveConversation(currentConversationPath, conversation);
        conversationStore.patch({ generating: false, unsaved: false });
    }
}
