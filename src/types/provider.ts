export interface ProviderConfig {
    id: string; // UUID
    name: string;
    type: 'openai-compatible'; // in the future we may support other providers; currently only openai-compatible
    base_url: string;
    api_key: string;
    models: ModelConfig[];
}

export interface ModelConfig {
    name: string;
    display_name: string;
    max_tokens?: number;
}

export interface ProviderSettingsFile {
    schema_version: 1;
    providers: ProviderConfig[];
}
