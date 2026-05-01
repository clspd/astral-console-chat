import { DYNDATA } from '@/dynamic.ts';
import type { Command } from '../types.ts';

export const aboutCommand: Command = {
    name: 'about',
    description: 'Show about information',
    execute(ctx) {
        const name = DYNDATA.packageJson?.name ?? 'astral-console-chat';
        const version = DYNDATA.packageJson?.version ?? 'unknown';
        const homepage = DYNDATA.packageJson?.homepage ?? '';
        const license = DYNDATA.packageJson?.license ?? '';
        const description = DYNDATA.packageJson?.description ?? '';

        const lines = [`${name} v${version}`, description, '', `License: ${license}`];
        if (homepage) {
            lines.push(`Homepage: ${homepage}`);
        }

        ctx.showAlert({
            title: 'About',
            description: lines.join('\n'),
        });
    },
};
