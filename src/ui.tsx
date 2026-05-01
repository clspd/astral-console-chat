import React from 'react';
import { render } from 'ink';
import { MessageProvider } from '@/utils/message.tsx';
import { ModalStackProvider } from '@/utils/modal.tsx';

export async function startApp(): Promise<void> {
    const App = (await import('./App.tsx')).default;
    const { waitUntilExit } = render(
        <MessageProvider>
            <ModalStackProvider>
                <App />
            </ModalStackProvider>
        </MessageProvider>,
        { alternateScreen: true, exitOnCtrlC: false },
    );
    await waitUntilExit();
}

export async function runOnboarding(onConfigure: () => void, onSkip: () => void): Promise<void> {
    const Onboarding = (await import('./components/Onboarding.tsx')).default;
    const { waitUntilExit } = render(<Onboarding onConfigure={onConfigure} onSkip={onSkip} />, {
        alternateScreen: true,
        exitOnCtrlC: false,
    });
    await waitUntilExit();
}
