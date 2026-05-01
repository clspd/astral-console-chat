import React from 'react';
import { render } from 'ink';
import { MessageProvider } from '@/utils/message.tsx';

export async function startApp(): Promise<void> {
    const App = (await import('./App.tsx')).default;
    const { waitUntilExit } = render(
        <MessageProvider>
            <App />
        </MessageProvider>,
        { alternateScreen: true, exitOnCtrlC: false },
    );
    await waitUntilExit();
}
