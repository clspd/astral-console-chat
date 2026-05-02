import React from 'react';
import { render } from 'ink';

export async function runOnboarding(onConfigure: () => void, onSkip: () => void): Promise<void> {
    const Onboarding = (await import('@/components/Onboarding.tsx')).default;
    const { waitUntilExit } = render(<Onboarding onConfigure={onConfigure} onSkip={onSkip} />, {
        alternateScreen: true,
        exitOnCtrlC: false,
    });
    await waitUntilExit();
}
