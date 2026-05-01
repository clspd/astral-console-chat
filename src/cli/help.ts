import { app_name } from '@/config.ts';

export function printHelp() {
    console.log(`Usage: ${app_name} [options] [input]\n`);
    console.log('Options:');
    console.log('  --help, -h       Show this help message');
    console.log('  --version, -V    Show version information');
    console.log('  --about          Show about information\n');
    console.log('Arguments:');
    console.log('  [input]          Path to a conversation file or chat name');
}
