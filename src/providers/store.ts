import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { getProviderSettingsPath } from '@/data/dirs.ts';
import { exists } from '@/utils/fsutil.ts';
import { createStore } from '@/states/store.ts';
import type { ProviderConfig, ModelConfig, ProviderSettingsFile } from '@/types/provider.ts';

export interface ProviderState {
    providers: ProviderConfig[];
    activeProviderId: string | null;
    activeModelName: string | null;
    initialized: boolean;
}

export const providerStore = createStore({
    state: (): ProviderState => ({
        providers: [],
        activeProviderId: null,
        activeModelName: null,
        initialized: false,
    }),
});

export async function initProviders(): Promise<void> {
    if (providerStore.initialized) return;

    const path = getProviderSettingsPath();
    if (await exists(path)) {
        const raw = await readFile(path, { encoding: 'utf-8' });
        const file: ProviderSettingsFile = JSON.parse(raw);
        providerStore.patch({
            providers: file.providers,
            initialized: true,
        });
    } else {
        providerStore.patch({ initialized: true });
    }
}

export async function saveProviders(): Promise<void> {
    const file: ProviderSettingsFile = {
        schema_version: 1,
        providers: providerStore.providers,
    };
    await writeFile(getProviderSettingsPath(), JSON.stringify(file, null, 2), 'utf-8');
}

export function addProvider(name: string, base_url: string, api_key: string): string {
    const id = randomUUID();
    const provider: ProviderConfig = {
        id,
        name,
        type: 'openai-compatible',
        base_url,
        api_key,
        models: [],
    };
    providerStore.patch({
        providers: [...providerStore.providers, provider],
    });
    void saveProviders();
    return id;
}

export function updateProvider(
    id: string,
    data: { name?: string; base_url?: string; api_key?: string },
): boolean {
    let found = false;
    const updated = providerStore.providers.map((p) => {
        if (p.id === id) {
            found = true;
            return { ...p, ...data };
        }
        return p;
    });
    if (found) {
        providerStore.patch({ providers: updated });
        void saveProviders();
    }
    return found;
}

export function deleteProvider(id: string): boolean {
    let found = false;
    const filtered = providerStore.providers.filter((p) => {
        if (p.id === id) {
            found = true;
            return false;
        }
        return true;
    });
    if (found) {
        providerStore.patch({
            providers: filtered,
            activeProviderId:
                providerStore.activeProviderId === id ? null : providerStore.activeProviderId,
            activeModelName:
                providerStore.activeProviderId === id ? null : providerStore.activeModelName,
        });
        void saveProviders();
    }
    return found;
}

export function getProviderByName(name: string): ProviderConfig | undefined {
    return providerStore.providers.find((p) => p.name === name);
}

export function getProviderById(id: string): ProviderConfig | undefined {
    return providerStore.providers.find((p) => p.id === id);
}

export function getActiveProvider(): ProviderConfig | undefined {
    if (!providerStore.activeProviderId) return undefined;
    return providerStore.providers.find((p) => p.id === providerStore.activeProviderId);
}

export function setActiveProvider(id: string | null): void {
    const provider = id ? getProviderById(id) : undefined;
    providerStore.patch({
        activeProviderId: id,
        activeModelName: provider && provider.models.length > 0 ? provider.models[0]!.name : null,
    });
}

export function setActiveProviderByName(name: string): boolean {
    const provider = getProviderByName(name);
    if (!provider) return false;
    setActiveProvider(provider.id);
    return true;
}

export function setActiveModel(modelName: string): boolean {
    const provider = getActiveProvider();
    if (!provider) return false;
    const model = provider.models.find((m) => m.name === modelName);
    if (!model) return false;
    providerStore.patch({ activeModelName: modelName });
    return true;
}

export function addModel(providerId: string, model: ModelConfig): boolean {
    let found = false;
    const updated = providerStore.providers.map((p) => {
        if (p.id === providerId) {
            found = true;
            if (p.models.some((m) => m.name === model.name)) return p;
            return { ...p, models: [...p.models, model] };
        }
        return p;
    });
    if (found) {
        providerStore.patch({ providers: updated });
        void saveProviders();
    }
    return found;
}

export function updateModel(
    providerId: string,
    modelName: string,
    data: Partial<Omit<ModelConfig, 'name'>>,
): boolean {
    let found = false;
    const updated = providerStore.providers.map((p) => {
        if (p.id === providerId) {
            found = true;
            return {
                ...p,
                models: p.models.map((m) => (m.name === modelName ? { ...m, ...data } : m)),
            };
        }
        return p;
    });
    if (found) {
        providerStore.patch({ providers: updated });
        void saveProviders();
    }
    return found;
}

export function deleteModel(providerId: string, modelName: string): boolean {
    let found = false;
    const updated = providerStore.providers.map((p) => {
        if (p.id === providerId) {
            const newModels = p.models.filter((m) => {
                if (m.name === modelName) {
                    found = true;
                    return false;
                }
                return true;
            });
            return { ...p, models: newModels };
        }
        return p;
    });
    if (found) {
        providerStore.patch({
            providers: updated,
            activeModelName:
                providerStore.activeModelName === modelName &&
                providerStore.activeProviderId === providerId
                    ? null
                    : providerStore.activeModelName,
        });
        void saveProviders();
    }
    return found;
}

export function setModelsForProvider(providerId: string, models: ModelConfig[]): boolean {
    let found = false;
    const updated = providerStore.providers.map((p) => {
        if (p.id === providerId) {
            found = true;
            return { ...p, models };
        }
        return p;
    });
    if (found) {
        providerStore.patch({ providers: updated });
        void saveProviders();
    }
    return found;
}

export function hasProviders(): boolean {
    return providerStore.providers.length > 0;
}
