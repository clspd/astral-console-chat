import { parseArgs } from 'node:util';

export interface CliOptions {
    action: (() => Promise<void>) | null;
    positionals: string[];
}

export function parseCliArgs(argv: string[]): CliOptions {
    const { values, positionals } = parseArgs({
        args: argv,
        options: {
            help: { type: 'boolean', short: 'h' },
            version: { type: 'boolean', short: 'V' },
            about: { type: 'boolean' },
        },
        allowPositionals: true,
    });

    let action: (() => Promise<void>) | null = null;

    if (values.help) {
        action = async () => {
            (await import('./help.js')).printHelp();
        };
    } else if (values.version) {
        action = async () => {
            (await import('./version.js')).printVersion();
        };
    } else if (values.about) {
        action = async () => {
            (await import('./about.js')).printAbout();
        };
    }

    return { action, positionals: positionals as string[] };
}
