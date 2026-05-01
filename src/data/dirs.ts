import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { exists } from '@/utils/fsutil.ts';
import { app_name, app_data_version } from '@/config.ts';

let _appDir: string | null = null;

export function getAppDir(): string {
    if (_appDir) return _appDir;

    if (process.platform === 'win32') {
        const appData = process.env.APPDATA;
        if (!appData) throw new Error('APPDATA environment variable is not set');
        _appDir = join(appData, app_name);
    } else {
        _appDir = join(homedir(), '.config', app_name);
    }

    return _appDir;
}

export function getChatsDir(): string {
    return join(getAppDir(), '_chats');
}

export function getSettingsPath(): string {
    return join(getAppDir(), 'settings.json');
}

export function getPreferencesPath(): string {
    return join(getAppDir(), 'preferences.json');
}

export function getProviderSettingsPath(): string {
    return join(getAppDir(), 'providers.json');
}

function getVersionPath(): string {
    return join(getAppDir(), '._version');
}

export async function initAppDir(): Promise<void> {
    const appDir = getAppDir();

    await mkdir(appDir, { recursive: true });

    await mkdir(getChatsDir(), { recursive: true });

    const versionPath = getVersionPath();
    if (!(await exists(versionPath))) {
        await writeFile(versionPath, app_data_version, 'utf-8');
    }
}

export async function checkVersion(): Promise<void> {
    const versionPath = getVersionPath();
    if (!(await exists(versionPath))) {
        throw new TypeError('Application data directory is corrupted: ._version file is missing');
    }
    const version = (await readFile(versionPath, { encoding: 'utf-8' })).trim();
    if (version !== app_data_version) {
        throw new TypeError(
            `Unsupported data directory version: expected ${app_data_version}, got ${version}`,
        );
    }
}
