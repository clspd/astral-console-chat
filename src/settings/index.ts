import JSON5 from 'json5';
import { readFile, writeFile } from 'node:fs/promises';
import { getPreferencesPath } from '@/data/dirs.ts';
import { exists } from '@/utils/fsutil.ts';

let settings: Record<string, unknown> = {};
let initialized = false;

export async function initSettings(): Promise<void> {
    const path = getPreferencesPath();
    if (await exists(path)) {
        const raw = await readFile(path, { encoding: 'utf-8' });
        settings = JSON5.parse(raw);
    }
    initialized = true;
}

async function save(): Promise<void> {
    const raw = JSON5.stringify(settings, null, 2);
    await writeFile(getPreferencesPath(), raw, 'utf-8');
}

function ensureInit(): void {
    if (!initialized) {
        throw new Error('Settings not initialized. Call initSettings() first.');
    }
}

function splitPath(path: string): string[] {
    return path.split('.');
}

export async function getSettings<T = unknown>(key: string): Promise<T | undefined> {
    ensureInit();
    const parts = splitPath(key);
    let current: unknown = settings;
    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }
    return current as T | undefined;
}

export async function putSettings<T = unknown>(key: string, value: T): Promise<void> {
    ensureInit();
    const parts = splitPath(key);
    let current: Record<string, unknown> = settings;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!;
        if (typeof current[part] !== 'object' || current[part] === null) {
            current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
    }
    const last = parts[parts.length - 1]!;
    current[last] = value;
    await save();
}

export async function deleteSettings(key: string): Promise<boolean> {
    ensureInit();
    const parts = splitPath(key);
    let current: Record<string, unknown> = settings;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!;
        if (typeof current[part] !== 'object' || current[part] === null) {
            return false;
        }
        current = current[part] as Record<string, unknown>;
    }
    const last = parts[parts.length - 1]!;
    if (last in current) {
        delete current[last];
        await save();
        return true;
    }
    return false;
}
