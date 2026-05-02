import React from 'react';
import { render } from 'ink';

export async function RenderFatalError(e: any): Promise<void> {
    const FatalErrorView = (await import('@/components/FatalErrorView.tsx')).default;
    const { waitUntilExit } = render(<FatalErrorView error={e} />, {
        alternateScreen: true,
        exitOnCtrlC: true,
    });
    await waitUntilExit();
}
