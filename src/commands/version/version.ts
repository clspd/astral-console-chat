import { app_name } from '@/config.ts';
import { DYNDATA } from '@/dynamic.ts';
import type { Command } from '../types.ts';

export const versionCommand: Command = {
    name: 'version',
    description: 'Show version information',
    execute(ctx, _rest) {
        const name = DYNDATA.packageJson?.name ?? app_name;
        const version = DYNDATA.packageJson?.version ?? 'unknown';
        const hash = DYNDATA.commithash ?? '';
        const desc = hash ? `commit: ${hash}` : '';
        ctx.showAlert({
            title: `${name} v${version}`,
            ...(desc ? { description: desc } : {}),
        });
    },
};
