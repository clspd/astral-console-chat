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
