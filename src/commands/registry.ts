import type { Command } from './types.ts';

const commands: Map<string, Command> = new Map();

export function registerCommand(command: Command): void {
    commands.set(command.name, command);
}

export function searchCommands(prefix: string): Command[] {
    const results: Command[] = [];
    for (const cmd of commands.values()) {
        if (cmd.name.startsWith(prefix)) {
            results.push(cmd);
        }
    }
    return results.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCommand(name: string): Command | undefined {
    return commands.get(name);
}

export function getAllCommands(): Command[] {
    return [...commands.values()].sort((a, b) => a.name.localeCompare(b.name));
}
