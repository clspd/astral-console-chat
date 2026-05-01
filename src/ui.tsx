import React from 'react';
import { render } from 'ink';

export async function startApp(): Promise<void> {
  const App = (await import('./App.tsx')).default;
  const { waitUntilExit } = render(<App />, { alternateScreen: true });
  await waitUntilExit();
}
