import { useCallback, useState } from 'react';
import { getCommand } from './registry.ts';
import { extractCommandName } from './utils.ts';
import type { AppContext } from './types.ts';
import { useMessage } from '@/utils/message.tsx';

export function useCommandDispatch(
    exit: () => void,
    showConfig: () => void,
    showProviderSelect: () => void,
    showModelSelect: () => void,
) {
    const [alert, setAlert] = useState<{ title: string; description?: string } | null>(null);
    const msg = useMessage();

    const showAlert = useCallback(
        (props: { title: string; description?: string }) => setAlert(props),
        [],
    );

    const ctx: AppContext = {
        exit,
        showAlert,
        message: {
            success: msg.success,
            warning: msg.warning,
        },
        showConfig,
        showProviderSelect,
        showModelSelect,
    };

    const executeCommand = useCallback(
        async (input: string): Promise<boolean> => {
            const spaceIndex = input.indexOf(' ');
            const cmdName = extractCommandName(input);
            const rest = spaceIndex === -1 ? '' : input.slice(spaceIndex + 1);
            const cmd = getCommand(cmdName);
            if (cmd) {
                await cmd.execute(ctx, rest);
                return true;
            }
            setAlert({ title: 'Unknown command', description: `Unknown command: /${cmdName}` });
            return false;
        },
        [ctx],
    );

    return { alert, setAlert, executeCommand };
}
