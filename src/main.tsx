import { parseCliArgs } from './cli/parse.js';
import { init } from './init.js';
import { startApp } from './ui.tsx';
import { runOnboarding } from './app/onboarding.tsx';
import { getSettings, putSettings } from '@/settings/index.ts';

let _openConfigOnStart = false;

export function shouldOpenConfigOnStart(): boolean {
    if (_openConfigOnStart) {
        _openConfigOnStart = false;
        return true;
    }
    return false;
}

export async function main(argc: number, argv: string[]): Promise<number> {
    const { action, positionals } = parseCliArgs(argv);

    if (action) {
        await action();
        return 0;
    }

    await init(positionals);

    const onboardingDone = await getSettings<boolean>('onboarding.completed');
    if (!onboardingDone) {
        await new Promise<void>((resolve) => {
            void runOnboarding(
                () => {
                    _openConfigOnStart = true;
                    void putSettings('onboarding.completed', true);
                    resolve();
                },
                () => {
                    void putSettings('onboarding.completed', true);
                    resolve();
                },
            );
        });
    }

    await startApp();
    return 0;
}
