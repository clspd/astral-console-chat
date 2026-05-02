import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { getProviderSettingsPath } from '@/data/dirs.ts';
import { exists } from '@/utils/fsutil.ts';
import { createStore } from '@/states/store.ts';
import { putSettings, getSettings, deleteSettings } from '@/settings/index.ts';
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

    const savedId = await getSettings<string | null>('provider.activeId');
    if (savedId && getProviderById(savedId)) {
        const prov = getProviderById(savedId)!;
        const savedModel = await getSettings<string | null>('provider.activeModel');
        const modelName =
            savedModel && prov.models.some((m) => m.name === savedModel)
                ? savedModel
                : prov.models.length > 0
                  ? prov.models[0]!.name
                  : null;
        providerStore.patch({
            activeProviderId: savedId,
            activeModelName: modelName,
        });
    }
}

export async function saveProviders(): Promise<void> {
    const file: ProviderSettingsFile = {
        schema_version: 1,
        providers: providerStore.providers,
    };
    await writeFile(getProviderSettingsPath(), JSON.stringify(file, null, 2), 'utf-8');
}

export async function addProvider(name: string, base_url: string, api_key: string): Promise<string> {
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
    await saveProviders();
    return id;
}

export async function updateProvider(
    id: string,
    data: { name?: string; base_url?: string; api_key?: string },
): Promise<boolean> {
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
        await saveProviders();
    }
    return found;
}

export async function deleteProvider(id: string): Promise<boolean> {
    let found = false;
    const filtered = providerStore.providers.filter((p) => {
        if (p.id === id) {
            found = true;
            return false;
        }
        return true;
    });
    if (found) {
        const wasActive = providerStore.activeProviderId === id;
        providerStore.patch({
            providers: filtered,
            activeProviderId: wasActive ? null : providerStore.activeProviderId,
            activeModelName: wasActive ? null : providerStore.activeModelName,
        });
        await saveProviders();
        if (wasActive) {
            await deleteSettings('provider.activeId');
            await deleteSettings('provider.activeModel');
        }
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

export async function setActiveProvider(id: string | null): Promise<void> {
    const provider = id ? getProviderById(id) : undefined;
    const modelName = provider && provider.models.length > 0 ? provider.models[0]!.name : null;
    providerStore.patch({
        activeProviderId: id,
        activeModelName: modelName,
    });
    await putSettings('provider.activeId', id);
    await putSettings('provider.activeModel', modelName);
}

export async function setActiveProviderByName(name: string): Promise<boolean> {
    const provider = getProviderByName(name);
    if (!provider) return false;
    await setActiveProvider(provider.id);
    return true;
}

export async function setActiveModel(modelName: string): Promise<boolean> {
    const provider = getActiveProvider();
    if (!provider) return false;
    const model = provider.models.find((m) => m.name === modelName);
    if (!model) return false;
    providerStore.patch({ activeModelName: modelName });
    await putSettings('provider.activeModel', modelName);
    return true;
}

export async function addModel(providerId: string, model: ModelConfig): Promise<boolean> {
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
        await saveProviders();
    }
    return found;
}

export async function updateModel(
    providerId: string,
    modelName: string,
    data: Partial<Omit<ModelConfig, 'name'>>,
): Promise<boolean> {
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
        await saveProviders();
    }
    return found;
}

export async function deleteModel(providerId: string, modelName: string): Promise<boolean> {
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
        const wasActive =
            providerStore.activeModelName === modelName &&
            providerStore.activeProviderId === providerId;
        providerStore.patch({
            providers: updated,
            activeModelName: wasActive ? null : providerStore.activeModelName,
        });
        await saveProviders();
        if (wasActive) {
            await deleteSettings('provider.activeModel');
        }
    }
    return found;
}

export async function setModelsForProvider(
    providerId: string,
    models: ModelConfig[],
): Promise<boolean> {
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
        await saveProviders();
    }
    return found;
}

export function hasProviders(): boolean {
    return providerStore.providers.length > 0;
}
