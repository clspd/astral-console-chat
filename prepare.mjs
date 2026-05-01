import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import LZString from 'lz-string';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
    const commitHash = execSync('git rev-parse HEAD', {
        encoding: 'utf-8',
        cwd: __dirname
    }).trim();

    const packageJson = await readFile('package.json', { encoding: 'utf-8' });
    const packageLock = await readFile('pnpm-lock.yaml', { encoding: 'utf-8' });

    const content = `// This is auto-generated file - do not modify manually
import LZString from 'lz-string';
import { parse } from 'yaml';
export const DYNDATA = {
    commithash: "${commitHash}",
    packageJson: JSON.parse(LZString.decompressFromBase64("${LZString.compressToBase64(packageJson)}")),
    pnpmLock: parse(LZString.decompressFromBase64("${LZString.compressToBase64(packageLock)}")),
};`;

    const targetPath = join(__dirname, 'src', 'dynamic.ts');
    await writeFile(targetPath, content, 'utf-8');

} catch (error) {
    console.error('Error generating dynamic.ts:', error);

    const fallbackContent = `export const DYNDATA = {
    commithash: ""
};`;

    try {
        const targetPath = join(__dirname, 'src', 'dynamic.ts');
        await writeFile(targetPath, fallbackContent, 'utf-8');
    } catch (writeError) {
        console.error('Error writing fallback content:', writeError);
    }

    process.exit(1);
}
