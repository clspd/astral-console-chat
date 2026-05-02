import { getAppDir } from '@/data/dirs.ts';

export async function sendReport(data: string): Promise<void> {
    const dir = getAppDir();
    const reportPath = `${dir}/error-report-${Date.now()}.txt`;
    await import('node:fs/promises').then((fs) => fs.writeFile(reportPath, data, 'utf-8'));
}
