import { useCallback, useState } from 'react';
import { getCommand } from './registry.ts';
import { extractCommandName } from './utils.ts';
import type { CommandContext } from './types.ts';

export function useCommandDispatch(exit: () => void) {
    const [alert, setAlert] = useState<{ title: string; description?: string } | null>(null);

    const showAlert = useCallback(
        (props: { title: string; description?: string }) => setAlert(props),
        [],
    );

    const executeCommand = useCallback(
        (input: string): boolean => {
            const cmdName = extractCommandName(input);
            const cmd = getCommand(cmdName);
            if (cmd) {
                cmd.execute({ exit, showAlert } satisfies CommandContext);
                return true;
            }
            setAlert({ title: 'Unknown command', description: `Unknown command: /${cmdName}` });
            return false;
        },
        [exit, showAlert],
    );

    return { alert, setAlert, executeCommand };
}
