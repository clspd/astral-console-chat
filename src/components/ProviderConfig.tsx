import React, { useCallback, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Modal } from '@/utils/modal.tsx';
import { providerStore } from '@/providers/store.ts';
import {
    addProvider,
    updateProvider,
    deleteProvider,
    addModel,
    deleteModel,
    setModelsForProvider,
} from '@/providers/store.ts';
import type { ProviderConfig, ModelConfig } from '@/types/provider.ts';

type ViewType = 'providersList' | 'providerForm' | 'modelList' | 'modelForm';

export interface ProviderConfigProps {
    open: boolean;
    onClose: () => void;
}

export default function ProviderConfig({ open, onClose }: ProviderConfigProps) {
    const [view, setView] = useState<ViewType>('providersList');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

    const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formBaseUrl, setFormBaseUrl] = useState('');
    const [formApiKey, setFormApiKey] = useState('');
    const [formFieldIndex, setFormFieldIndex] = useState(0);

    const [modelSelIndex, setModelSelIndex] = useState(0);
    const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
    const [modelName, setModelName] = useState('');
    const [modelDisplayName, setModelDisplayName] = useState('');
    const [modelMaxTokens, setModelMaxTokens] = useState('');
    const [mFormFieldIdx, setMFormFieldIdx] = useState(0);

    const [message, setMessage] = useState<string | null>(null);
    const [fetchingModels, setFetchingModels] = useState(false);

    const providers = providerStore.use((s) => s.providers);
    const activeProviderId = providerStore.use((s) => s.activeProviderId);

    const selectedProvider = selectedProviderId
        ? providers.find((p) => p.id === selectedProviderId)
        : undefined;

    const showMessage = useCallback((msg: string) => {
        setMessage(msg);
    }, []);

    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(t);
    }, [message]);

    const enterModelForm = useCallback((model: ModelConfig | null) => {
        setEditingModel(model);
        if (model) {
            setModelName(model.name);
            setModelDisplayName(model.display_name);
            setModelMaxTokens(model.max_tokens?.toString() ?? '');
        } else {
            setModelName('');
            setModelDisplayName('');
            setModelMaxTokens('');
        }
        setMFormFieldIdx(0);
        setView('modelForm');
    }, []);

    const submitModelForm = useCallback(() => {
        const n = modelName.trim();
        const d = modelDisplayName.trim();
        if (!n || !d) {
            showMessage('Model name and display name are required');
            return;
        }
        if (!selectedProviderId) return;

        const model: ModelConfig = { name: n, display_name: d };
        const parsed = modelMaxTokens.trim() ? parseInt(modelMaxTokens.trim(), 10) : undefined;
        if (parsed !== undefined && !isNaN(parsed)) model.max_tokens = parsed;

        if (editingModel && editingModel.name !== n) {
            void deleteModel(selectedProviderId, editingModel.name);
        }

        void addModel(selectedProviderId, model);
        showMessage('Model saved');
        setView('modelList');
        setModelSelIndex(0);
    }, [
        modelName,
        modelDisplayName,
        modelMaxTokens,
        selectedProviderId,
        editingModel,
        showMessage,
    ]);

    const handleDeleteModel = useCallback(() => {
        if (!selectedProviderId || !selectedProvider) return;
        if (selectedProvider.models.length === 0) return;
        const model = selectedProvider.models[modelSelIndex];
        if (!model) return;
        void deleteModel(selectedProviderId, model.name);
        showMessage('Model deleted');
        setModelSelIndex(Math.max(0, modelSelIndex - 1));
    }, [selectedProviderId, selectedProvider, modelSelIndex, showMessage]);

    const handleAutoFetch = useCallback(async () => {
        if (!selectedProviderId || !selectedProvider) return;
        setFetchingModels(true);
        setMessage('Fetching models...');
        try {
            const baseUrl = selectedProvider.base_url.replace(/\/+$/, '');
            const resp = await fetch(`${baseUrl}/models`, {
                headers: {
                    Authorization: `Bearer ${selectedProvider.api_key}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            const data = (await resp.json()) as { data?: Array<{ id: string }> };
            const list = data.data ?? [];
            const models: ModelConfig[] = list.map((m) => ({ name: m.id, display_name: m.id }));
            await setModelsForProvider(selectedProviderId, models);
            showMessage(`Fetched ${models.length} models`);
        } catch (err) {
            showMessage(`Failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setFetchingModels(false);
        }
    }, [selectedProviderId, selectedProvider, showMessage]);

    const submitProviderForm = useCallback(() => {
        const n = formName.trim();
        const u = formBaseUrl.trim();
        const k = formApiKey.trim();
        if (!n || !u || !k) {
            showMessage('All fields are required');
            return;
        }
        if (editingProviderId) {
            void updateProvider(editingProviderId, { name: n, base_url: u, api_key: k });
            showMessage('Provider updated');
        } else {
            void addProvider(n, u, k);
            showMessage('Provider added');
        }
        setEditingProviderId(null);
        setFormName('');
        setFormBaseUrl('');
        setFormApiKey('');
        setFormFieldIndex(0);
        setView('providersList');
    }, [formName, formBaseUrl, formApiKey, editingProviderId, showMessage]);

    useEffect(() => {
        if (!open) {
            setView('providersList');
            setSelectedIndex(0);
            setSelectedProviderId(null);
            setEditingProviderId(null);
            setFormName('');
            setFormBaseUrl('');
            setFormApiKey('');
            setFormFieldIndex(0);
            setModelSelIndex(0);
            setEditingModel(null);
            setModelName('');
            setModelDisplayName('');
            setModelMaxTokens('');
            setMessage(null);
        }
    }, [open]);

    useInput(
        (input, key) => {
            if (!open) return;

            if (key.escape) {
                if (view === 'providerForm') {
                    setView(editingProviderId ? 'providersList' : 'providersList');
                    setEditingProviderId(null);
                    return;
                }
                if (view === 'modelForm') {
                    setView('modelList');
                    return;
                }
                if (view === 'modelList') {
                    setView('providersList');
                    setSelectedProviderId(null);
                    return;
                }
                onClose();
                return;
            }

            /* ---- providersList ---- */
            if (view === 'providersList') {
                if (key.upArrow) {
                    setSelectedIndex((p) => Math.max(0, p - 1));
                    return;
                }
                if (key.downArrow) {
                    setSelectedIndex((p) => Math.min(providers.length - 1, p + 1));
                    return;
                }
                if (key.return && providers.length > 0) {
                    const p = providers[selectedIndex];
                    if (p) {
                        setSelectedProviderId(p.id);
                        setModelSelIndex(0);
                        setView('modelList');
                    }
                    return;
                }
                if (input === 'a') {
                    setEditingProviderId(null);
                    setFormName('');
                    setFormBaseUrl('');
                    setFormApiKey('');
                    setFormFieldIndex(0);
                    setView('providerForm');
                    return;
                }
                if (input === 'd' && providers.length > 0) {
                    const p = providers[selectedIndex];
                    if (p) {
                        void deleteProvider(p.id);
                        showMessage('Provider deleted');
                        setSelectedIndex(Math.max(0, selectedIndex - 1));
                    }
                    return;
                }
                if (input === 'e' && providers.length > 0) {
                    const p = providers[selectedIndex];
                    if (p) {
                        setEditingProviderId(p.id);
                        setFormName(p.name);
                        setFormBaseUrl(p.base_url);
                        setFormApiKey(p.api_key);
                        setFormFieldIndex(0);
                        setView('providerForm');
                    }
                    return;
                }
                return;
            }

            /* ---- providerForm ---- */
            if (view === 'providerForm') {
                if (key.tab || (key.return && formFieldIndex < 2)) {
                    setFormFieldIndex((p) => (p + 1) % 3);
                    return;
                }
                if (key.return && formFieldIndex === 2) {
                    submitProviderForm();
                    return;
                }
                return;
            }

            /* ---- modelList ---- */
            if (view === 'modelList' && selectedProvider) {
                const models = selectedProvider.models;
                if (key.upArrow) {
                    setModelSelIndex((p) =>
                        p === 0 && models.length > 0 ? models.length - 1 : Math.max(0, p - 1),
                    );
                    return;
                }
                if (key.downArrow) {
                    setModelSelIndex((p) => (p >= models.length - 1 ? 0 : p + 1));
                    return;
                }
                if (key.return && models.length > 0) {
                    const m = models[modelSelIndex];
                    if (m) enterModelForm(m);
                    return;
                }
                if (input === 'a') {
                    enterModelForm(null);
                    return;
                }
                if (input === 'd' && models.length > 0) {
                    handleDeleteModel();
                    return;
                }
                if (input === 'f') {
                    void handleAutoFetch();
                    return;
                }
                return;
            }

            /* ---- modelForm ---- */
            if (view === 'modelForm') {
                if (key.tab || (key.return && mFormFieldIdx < 2)) {
                    setMFormFieldIdx((p) => (p + 1) % 3);
                    return;
                }
                if (key.return && mFormFieldIdx === 2) {
                    submitModelForm();
                    return;
                }
                return;
            }
        },
        { isActive: open },
    );

    return (
        <Modal
            open={open}
            title="Provider Configuration"
            onRequestClose={onClose}
            closeOnEscape={false}
            maxWidth={80}
        >
            <Box flexDirection="column">
                {message ? (
                    <Box marginBottom={1}>
                        <Text color="yellow">{message}</Text>
                    </Box>
                ) : null}

                {/* ========= providersList ========= */}
                {view === 'providersList' ? (
                    <Box flexDirection="column">
                        <Box marginBottom={1}>
                            <Text bold>Providers ({providers.length})</Text>
                        </Box>
                        {providers.length === 0 ? (
                            <Box marginBottom={1}>
                                <Text dimColor>No providers. Press 'a' to add one.</Text>
                            </Box>
                        ) : (
                            providers.map((p, i) => (
                                <Box key={p.id}>
                                    <Text {...(i === selectedIndex ? { color: 'cyan' } : {})}>
                                        {i === selectedIndex ? '> ' : '  '}
                                        {p.name}
                                        {p.id === activeProviderId ? ' [active]' : ''}
                                        {p.models.length ? ` (${p.models.length} models)` : ''}
                                    </Text>
                                </Box>
                            ))
                        )}
                        <Box marginTop={1} flexDirection="column">
                            <Text dimColor>
                                [a] Add [e] Edit [d] Delete [Enter] Manage Models [Esc] Close
                            </Text>
                        </Box>
                    </Box>
                ) : null}

                {/* ========= providerForm ========= */}
                {view === 'providerForm' ? (
                    <Box flexDirection="column">
                        <Box marginBottom={1}>
                            <Text bold>{editingProviderId ? 'Edit Provider' : 'Add Provider'}</Text>
                        </Box>
                        <Box marginBottom={1}>
                            <Text {...(formFieldIndex === 0 ? { color: 'cyan' } : {})}>
                                {'> '}Name:{' '}
                            </Text>
                            <TextInput
                                value={formName}
                                onChange={setFormName}
                                focus={formFieldIndex === 0}
                            />
                        </Box>
                        <Box marginBottom={1}>
                            <Text {...(formFieldIndex === 1 ? { color: 'cyan' } : {})}>
                                {'> '}Base URL:{' '}
                            </Text>
                            <TextInput
                                value={formBaseUrl}
                                onChange={setFormBaseUrl}
                                focus={formFieldIndex === 1}
                            />
                        </Box>
                        <Box marginBottom={1}>
                            <Text {...(formFieldIndex === 2 ? { color: 'cyan' } : {})}>
                                {'> '}API Key:{' '}
                            </Text>
                            <TextInput
                                value={formApiKey}
                                onChange={setFormApiKey}
                                focus={formFieldIndex === 2}
                                mask="*"
                            />
                        </Box>
                        <Box marginTop={1} flexDirection="column">
                            <Text dimColor>[Tab] Next Field [Enter] Confirm [Esc] Cancel</Text>
                        </Box>
                    </Box>
                ) : null}

                {/* ========= modelList ========= */}
                {view === 'modelList' && selectedProvider ? (
                    <Box flexDirection="column">
                        <Box marginBottom={1}>
                            <Text bold>Models for {selectedProvider.name}</Text>
                        </Box>
                        {selectedProvider.models.length === 0 ? (
                            <Box marginBottom={1}>
                                <Text dimColor>
                                    No models. Press 'a' to add or 'f' to auto-fetch.
                                </Text>
                            </Box>
                        ) : (
                            selectedProvider.models.map((m, i) => (
                                <Box key={`${m.name}-${i}`}>
                                    <Text {...(i === modelSelIndex ? { color: 'cyan' } : {})}>
                                        {i === modelSelIndex ? '> ' : '  '}
                                        {m.display_name} ({m.name})
                                        {m.max_tokens ? ` - max ${m.max_tokens} tokens` : ''}
                                    </Text>
                                </Box>
                            ))
                        )}
                        <Box marginTop={1} flexDirection="column">
                            <Text dimColor>
                                [a] Add [Enter] Edit [d] Delete [f] Auto Fetch [Esc] Back
                            </Text>
                            {fetchingModels ? <Text color="yellow">Fetching models...</Text> : null}
                        </Box>
                    </Box>
                ) : null}

                {/* ========= modelForm ========= */}
                {view === 'modelForm' ? (
                    <Box flexDirection="column">
                        <Box marginBottom={1}>
                            <Text bold>
                                {editingModel ? `Edit Model: ${editingModel.name}` : 'Add Model'}
                            </Text>
                        </Box>
                        <Box marginBottom={1}>
                            <Text {...(mFormFieldIdx === 0 ? { color: 'cyan' } : {})}>
                                {'> '}Model Name:{' '}
                            </Text>
                            <TextInput
                                value={modelName}
                                onChange={setModelName}
                                focus={mFormFieldIdx === 0}
                            />
                        </Box>
                        <Box marginBottom={1}>
                            <Text {...(mFormFieldIdx === 1 ? { color: 'cyan' } : {})}>
                                {'> '}Display Name:{' '}
                            </Text>
                            <TextInput
                                value={modelDisplayName}
                                onChange={setModelDisplayName}
                                focus={mFormFieldIdx === 1}
                            />
                        </Box>
                        <Box marginBottom={1}>
                            <Text {...(mFormFieldIdx === 2 ? { color: 'cyan' } : {})}>
                                {'> '}Max Tokens:{' '}
                            </Text>
                            <TextInput
                                value={modelMaxTokens}
                                onChange={setModelMaxTokens}
                                focus={mFormFieldIdx === 2}
                            />
                        </Box>
                        <Box marginTop={1} flexDirection="column">
                            <Text dimColor>[Tab] Next Field [Enter] Confirm [Esc] Back</Text>
                        </Box>
                    </Box>
                ) : null}
            </Box>
        </Modal>
    );
}
