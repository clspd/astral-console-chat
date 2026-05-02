import type { Command, AppContext } from '../types.ts';
import { setActiveModel } from '@/providers/store.ts';

export const modelCommand: Command = {
    name: 'model',
    description: 'Switch AI model',
    description2: '[name]',
    async execute(ctx: AppContext, rest: string) {
        const name = rest.trim();

        if (!name) {
            ctx.showModelSelect();
            return;
        }

        const success = await setActiveModel(name);
        if (success) {
            ctx.message.success(`Switched to model "${name}"`);
        } else {
            ctx.message.warning(
                `Model "${name}" not found in current provider. Use /setup to configure models.`,
            );
        }
    },
};
