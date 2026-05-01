import { parseCliArgs } from './cli/parse.js';
import { init } from './init.js';
import { startApp } from './ui.tsx';

export async function main(argc: number, argv: string[]): Promise<number> {
    const { action, positionals } = parseCliArgs(argv);

    if (action) {
        await action();
        return 0;
    }

    await init(positionals);
    await startApp();
    return 0;
}
