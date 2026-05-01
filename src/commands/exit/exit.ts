import type { Command } from '../types.ts';

export const exitCommand: Command = {
    name: 'exit',
    description: 'Exit the application',
    execute(ctx, _rest) {
        ctx.exit();
    },
};
