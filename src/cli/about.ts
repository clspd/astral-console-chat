import { DYNDATA } from '@/dynamic.ts';

export function printAbout() {
    const name = DYNDATA.packageJson?.name ?? 'astral-console-chat';
    const version = DYNDATA.packageJson?.version ?? 'unknown';
    const description = DYNDATA.packageJson?.description ?? '';
    const license = DYNDATA.packageJson?.license ?? '';
    const homepage = DYNDATA.packageJson?.homepage ?? '';

    console.log(`${name} v${version}`);
    if (description) console.log(description);
    console.log(`License: ${license}`);
    if (homepage) console.log(`Homepage: ${homepage}`);
}
