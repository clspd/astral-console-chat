import type { Command, AppContext } from '../types.ts';
import { getSettings, putSettings } from '@/settings/index.ts';

export const settingsCommand: Command = {
    name: 'settings',
    description: 'Manage settings',
    description2: '(get|put) <key> <type> <value>',
    async execute(ctx: AppContext, rest: string) {
        const args = rest.trim().split(/\s+/);
        const action = args[0];
        const key = args[1];

        if (!action || !key) {
            ctx.message.warning('Usage: /settings (get|put) <key> <type> <value>');
            return;
        }

        if (action === 'put' && args.length < 4) {
            ctx.message.warning('Usage: /settings put <key> <int|string> <value>');
            return;
        }

        if (action === 'get') {
            const val = await getSettings(key);

            if (val === undefined) {
                ctx.showAlert({
                    title: `Settings: ${key}`,
                    description: '(not set)',
                });
                return;
            }

            if (typeof val === 'object' && val !== null) {
                ctx.showAlert({
                    title: `Settings: ${key}`,
                    description:
                        'Unsupported value type, please view this settings in preferences file',
                });
                return;
            }

            ctx.showAlert({
                title: `Settings: ${key}`,
                description: String(val),
            });
            return;
        }

        if (action === 'put') {
            const type = args[2];
            const raw = args.slice(3).join(' ');

            let value: unknown;
            if (type === 'int') {
                const n = Number(raw);
                if (!Number.isInteger(n)) {
                    ctx.message.warning(`Invalid integer: "${raw}"`);
                    return;
                }
                value = n;
            } else if (type === 'string') {
                value = raw;
            } else {
                ctx.message.warning(`Unknown type "${type}". Use int or string.`);
                return;
            }

            await putSettings(key, value);
            ctx.message.success(`Setting "${key}" updated`);
            return;
        }

        ctx.message.warning(`Unknown action "${action}". Use get or put.`);
    },
};
