import { useCallback, useState } from 'react';
import { getCommand } from './registry.ts';
import { extractCommandName } from './utils.ts';
import type { CommandContext } from './types.ts';

export function useCommandDispatch(
    exit: () => void,
    showConfig?: () => void,
    showProviderSelect?: () => void,
    showModelSelect?: () => void,
) {
    const [alert, setAlert] = useState<{ title: string; description?: string } | null>(null);

    const showAlert = useCallback(
        (props: { title: string; description?: string }) => setAlert(props),
        [],
    );

    const executeCommand = useCallback(
        (input: string): boolean => {
            const spaceIndex = input.indexOf(' ');
            const cmdName = extractCommandName(input);
            const rest = spaceIndex === -1 ? '' : input.slice(spaceIndex + 1);
            const cmd = getCommand(cmdName);
            if (cmd) {
                const ctx: CommandContext = {
                    exit,
                    showAlert,
                    ...(showConfig ? { showConfig } : {}),
                    ...(showProviderSelect ? { showProviderSelect } : {}),
                    ...(showModelSelect ? { showModelSelect } : {}),
                };
                cmd.execute(ctx, rest);
                return true;
            }
            setAlert({ title: 'Unknown command', description: `Unknown command: /${cmdName}` });
            return false;
        },
        [exit, showAlert, showConfig, showProviderSelect, showModelSelect],
    );

    return { alert, setAlert, executeCommand };
}
