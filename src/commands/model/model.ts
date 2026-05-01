import type { Command, CommandContext } from '../types.ts';
import { setActiveModel } from '@/providers/store.ts';

export const modelCommand: Command = {
    name: 'model',
    description: 'Switch AI model (/model [name])',
    execute(ctx: CommandContext, rest: string) {
        const name = rest.trim();

        if (!name) {
            ctx.showModelSelect?.();
            return;
        }

        const success = setActiveModel(name);
        if (success) {
            ctx.showAlert({ title: 'Model Changed', description: `Switched to model "${name}"` });
        } else {
            ctx.showAlert({
                title: 'Model Not Found',
                description: `Model "${name}" not found in current provider. Use /setup to configure models.`,
            });
        }
    },
};
