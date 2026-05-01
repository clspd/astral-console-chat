#!/usr/bin/env node
import { main } from './main.tsx';

try {
    const args = process.argv.slice(2);
    await main(args.length, args);
} catch (e) {
    // report...

    console.error(e);

    process.exit(-1);
}
