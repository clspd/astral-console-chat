import { sha256 } from './utils/sha256.ts';

export const appid = await sha256('https://www.npmjs.com/package/astral-console-chat');
export const app_name = 'astral-console-chat';
export const app_data_version = '1';

