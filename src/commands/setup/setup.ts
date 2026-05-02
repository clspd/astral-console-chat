import type { Command, AppContext } from '../types.ts';

export const setupCommand: Command = {
    name: 'setup',
    description: 'Open provider configuration',
    execute(ctx: AppContext) {
        ctx.showConfig();
    },
};
