import { app_name } from '@/config.ts';
import { DYNDATA } from '@/dynamic.ts';

export function printVersion() {
    const name = app_name;
    const version = DYNDATA.packageJson?.version ?? 'unknown';
    const hash = DYNDATA.commithash ?? '';

    console.log(`${name} v${version}`);
    if (hash) {
        console.log(`commit: ${hash}`);
    }
}
