import { readFile, appendFile } from 'node:fs/promises';
import { getHistoryPath } from '@/data/dirs.ts';
import { exists } from '@/utils/fsutil.ts';

const MAX_SIZE = 1000;

let history: string[] = [];
let index: number = -1; // -1 = not navigating
let staging: string = '';

export async function loadHistory(): Promise<void> {
    const path = getHistoryPath();
    if (!(await exists(path))) return;
    const raw = await readFile(path, { encoding: 'utf-8' });
    history = [];
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
            const obj = JSON.parse(trimmed) as { content: string };
            if (obj.content) history.push(obj.content);
        } catch { /* skip malformed lines */ }
    }
}

export async function addHistory(content: string): Promise<void> {
    if (!content.trim()) return;
    if (history.length > 0 && history[history.length - 1] === content) return;

    history.push(content);
    if (history.length > MAX_SIZE) {
        history = history.slice(-MAX_SIZE);
    }

    const line = JSON.stringify({ content }) + '\n';
    await appendFile(getHistoryPath(), line, 'utf-8');
}

export function navigateUp(currentInput: string): string | null {
    if (history.length === 0) return null;
    if (index === -1) {
        staging = currentInput;
        index = history.length;
    }
    if (index <= 0) return null;
    index--;
    return history[index]!;
}

export function navigateDown(): string | null {
    if (index === -1) return null;
    if (index >= history.length - 1) {
        const saved = staging;
        index = -1;
        staging = '';
        return saved;
    }
    index++;
    return history[index]!;
}

export function endNavigation(): void {
    index = -1;
    staging = '';
}
