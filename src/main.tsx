import { parseArgs } from 'node:util';
import { init } from './init.js';
import { startApp } from './ui.tsx';

export async function main(argc: number, argv: string[]): Promise<number> {
    const { values, positionals } = parseArgs({
        args: argv,
        options: {
            help: { type: 'boolean', short: 'h' },
        },
        positional: ['input'],
        allowPositionals: true,
    });

    if (values.help) {
        (await import('./cli/help.ts')).printHelp();
        return 0;
    }

    await init(values, positionals);

    await startApp();
    return 0;
}
