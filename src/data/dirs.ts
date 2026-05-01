import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const APP_NAME = 'astral-console-chat';
const VERSION = '1';

let _appDir: string | null = null;

/** 获取应用数据目录（Windows: %AppData% ；POSIX: $HOME/.config） */
export function getAppDir(): string {
  if (_appDir) return _appDir;

  if (process.platform === 'win32') {
    const appData = process.env.APPDATA;
    if (!appData) throw new Error('APPDATA environment variable is not set');
    _appDir = join(appData, APP_NAME);
  } else {
    _appDir = join(homedir(), '.config', APP_NAME);
  }

  return _appDir;
}

/** 获取 _chats 目录路径 */
export function getChatsDir(): string {
  return join(getAppDir(), '_chats');
}

/** 获取 settings.json 路径 */
export function getSettingsPath(): string {
  return join(getAppDir(), 'settings.json');
}

/** 获取 preferences.json 路径 */
export function getPreferencesPath(): string {
  return join(getAppDir(), 'preferences.json');
}

/** 获取 ._version 文件路径 */
function getVersionPath(): string {
  return join(getAppDir(), '._version');
}

/** 初始化应用数据目录结构 */
export function initAppDir(): void {
  const appDir = getAppDir();

  // 创建主目录
  mkdirSync(appDir, { recursive: true });

  // 创建 _chats 子目录
  mkdirSync(getChatsDir(), { recursive: true });

  // 写入 ._version 文件
  const versionPath = getVersionPath();
  if (!existsSync(versionPath)) {
    writeFileSync(versionPath, VERSION, 'utf-8');
  }
}

/** 验证 ._version 文件 */
export function checkVersion(): void {
  const versionPath = getVersionPath();
  if (!existsSync(versionPath)) {
    throw new Error('Application data directory is corrupted: ._version file is missing');
  }
  const version = readFileSync(versionPath, 'utf-8').trim();
  if (version !== VERSION) {
    throw new Error(
      `Unsupported data directory version: expected ${VERSION}, got ${version}`,
    );
  }
}
