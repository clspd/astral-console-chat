#!/usr/bin/env node
import { main } from './main.tsx';
import { RenderFatalError } from './app/error.tsx';

try {
    const args = process.argv.slice(2);
    await main(args.length, args);
} catch (e) {
    // report...

    await RenderFatalError(e);

    console.error(e);

    process.exit(-1);
}
