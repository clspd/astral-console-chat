import type { Command, AppContext } from '../types.ts';
import { setActiveProviderByName } from '@/providers/store.ts';

export const providerCommand: Command = {
    name: 'provider',
    description: 'Switch AI provider',
    description2: '[name]',
    async execute(ctx: AppContext, rest: string) {
        const name = rest.trim();

        if (!name) {
            ctx.showProviderSelect();
            return;
        }

        const success = await setActiveProviderByName(name);
        if (success) {
            ctx.message.success(`Switched to provider "${name}"`);
        } else {
            ctx.message.warning(`Provider "${name}" not found. Use /setup to configure providers.`);
        }
    },
};
