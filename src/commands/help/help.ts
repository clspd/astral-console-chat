import { getAllCommands } from '../registry.ts';
import type { Command } from '../types.ts';

function formatHelp(): string {
    const commands = getAllCommands();
    const lines = ['Available commands:\n'];
    for (const cmd of commands) {
        lines.push(`  /${cmd.name} — ${cmd.description}`);
    }
    return lines.join('\n');
}

export const helpCommand: Command = {
    name: 'help',
    description: 'Show help information',
    execute(ctx) {
        ctx.showAlert({
            title: 'Help',
            description: formatHelp(),
        });
    },
};
