import type { Command, CommandContext } from '../types.ts';
import { setActiveProviderByName } from '@/providers/store.ts';

export const providerCommand: Command = {
    name: 'provider',
    description: 'Switch AI provider (/provider [name])',
    execute(ctx: CommandContext, rest: string) {
        const name = rest.trim();

        if (!name) {
            ctx.showProviderSelect?.();
            return;
        }

        const success = setActiveProviderByName(name);
        if (success) {
            ctx.showAlert({
                title: 'Provider Changed',
                description: `Switched to provider "${name}"`,
            });
        } else {
            ctx.showAlert({
                title: 'Provider Not Found',
                description: `Provider "${name}" not found. Use /setup to configure providers.`,
            });
        }
    },
};
