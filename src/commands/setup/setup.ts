import type { Command, CommandContext } from '../types.ts';

export const setupCommand: Command = {
    name: 'setup',
    description: 'Open provider configuration',
    execute(ctx: CommandContext) {
        ctx.showConfig?.();
    },
};
