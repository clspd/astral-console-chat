import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';
import { getActiveProvider, providerStore } from '@/providers/store.ts';

let _cacheId: string | null = null;
let _provider: ReturnType<typeof createOpenAICompatible> | null = null;

function getProvider(): ReturnType<typeof createOpenAICompatible> | null {
    const active = getActiveProvider();
    if (!active) return null;

    if (_cacheId === active.id && _provider) return _provider;

    _provider = createOpenAICompatible({
        name: active.name,
        baseURL: active.base_url,
        apiKey: active.api_key,
    });
    _cacheId = active.id;
    return _provider;
}

export function getLanguageModel(modelName?: string): LanguageModel | null {
    const provider = getProvider();
    if (!provider) return null;

    const active = getActiveProvider();
    const model = modelName ?? providerStore.activeModelName ?? active?.models[0]?.name;
    if (!model) return null;

    return provider(model);
}
