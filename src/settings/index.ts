import JSON5 from 'json5';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { getPreferencesPath, getSettingsPath } from '@/data/dirs.ts';
import { exists } from '@/utils/fsutil.ts';

let preferences: Record<string, unknown> = {};
let settingsOverlay: Record<string, unknown> = {};
let prefsMtime = 0;
let initialized = false;

async function loadPreferences(): Promise<void> {
    const path = getPreferencesPath();
    if (await exists(path)) {
        const raw = await readFile(path, { encoding: 'utf-8' });
        preferences = JSON5.parse(raw);
    } else {
        preferences = {};
    }
}

export async function initSettings(): Promise<void> {
    const prefsPath = getPreferencesPath();
    if (await exists(prefsPath)) {
        const s = await stat(prefsPath);
        prefsMtime = s.mtimeMs;
        const raw = await readFile(prefsPath, { encoding: 'utf-8' });
        preferences = JSON5.parse(raw);
    }

    const settingsPath = getSettingsPath();
    if (await exists(settingsPath)) {
        const raw = await readFile(settingsPath, { encoding: 'utf-8' });
        settingsOverlay = JSON5.parse(raw);
    }

    initialized = true;
}

async function reloadIfChanged(): Promise<void> {
    const path = getPreferencesPath();
    if (!(await exists(path))) {
        if (prefsMtime !== 0) {
            preferences = {};
            prefsMtime = 0;
        }
        return;
    }
    const s = await stat(path);
    if (s.mtimeMs !== prefsMtime) {
        await loadPreferences();
        prefsMtime = s.mtimeMs;
    }
}

async function save(): Promise<void> {
    const path = getPreferencesPath();
    const raw = JSON5.stringify(preferences, null, 2);
    await writeFile(path, raw, 'utf-8');
    const s = await stat(path);
    prefsMtime = s.mtimeMs;
}

function ensureInit(): void {
    if (!initialized) {
        throw new Error('Settings not initialized. Call initSettings() first.');
    }
}

function splitPath(path: string): string[] {
    return path.split('.');
}

function getFrom(obj: Record<string, unknown>, key: string): unknown {
    const parts = splitPath(key);
    let current: unknown = obj;
    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }
    return current;
}

export async function getSettings<T = unknown>(key: string): Promise<T | undefined> {
    ensureInit();
    await reloadIfChanged();

    const overlayVal = getFrom(settingsOverlay, key);
    if (overlayVal !== undefined) {
        return overlayVal as T;
    }
    return getFrom(preferences, key) as T | undefined;
}

export async function putSettings<T = unknown>(key: string, value: T): Promise<void> {
    ensureInit();
    const parts = splitPath(key);
    let current: Record<string, unknown> = preferences;
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
    let current: Record<string, unknown> = preferences;
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
