import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Box, Text, useInput, useWindowSize, type BoxProps } from 'ink';

/* =========================================================
 * Modal stack (optional)
 * ======================================================= */

type ModalStackApi = {
    register: (id: string) => void;
    unregister: (id: string) => void;
    isTopMost: (id: string) => boolean;
    count: number;
};

const ModalStackContext = createContext<ModalStackApi | null>(null);

export function useModalActive(): boolean {
    const stack = useContext(ModalStackContext);
    return (stack?.count ?? 0) > 0;
}

export function ModalStackProvider({ children }: { children: ReactNode }) {
    const [stack, setStack] = useState<string[]>([]);
    const stackRef = useRef<string[]>([]);

    const register = useCallback((id: string) => {
        setStack((prev) => {
            if (prev.includes(id)) return prev;
            const next = [...prev, id];
            stackRef.current = next;
            return next;
        });
    }, []);

    const unregister = useCallback((id: string) => {
        setStack((prev) => {
            const next = prev.filter((x) => x !== id);
            stackRef.current = next;
            return next;
        });
    }, []);

    const isTopMost = useCallback((id: string) => {
        const s = stackRef.current;
        return s.length > 0 && s[s.length - 1] === id;
    }, []);

    const value = useMemo<ModalStackApi>(
        () => ({ register, unregister, isTopMost, count: stack.length }),
        [register, unregister, isTopMost, stack.length],
    );

    return <ModalStackContext.Provider value={value}>{children}</ModalStackContext.Provider>;
}

/* =========================================================
 * Modal
 * ======================================================= */

export type ModalProps = {
    open: boolean;
    title?: ReactNode;
    children: ReactNode;
    onRequestClose?: () => void;
    closeOnEscape?: boolean;
    maxWidth?: number;
    panelProps?: Omit<BoxProps, 'children'>;
};

export function Modal({
    open,
    title,
    children,
    onRequestClose,
    closeOnEscape = true,
    maxWidth = 76,
    panelProps,
}: ModalProps) {
    const { columns, rows } = useWindowSize();
    const stack = useContext(ModalStackContext);
    const id = useId();

    useEffect(() => {
        if (!stack) return;

        if (open) {
            stack.register(id);
        } else {
            stack.unregister(id);
        }

        return () => {
            stack.unregister(id);
        };
    }, [open, id]);

    const isTopMost = stack ? stack.isTopMost(id) : true;

    useInput(
        (_input, key) => {
            if (!open || !isTopMost) return;

            if (key.escape && closeOnEscape) {
                onRequestClose?.();
            }
        },
        { isActive: open && isTopMost },
    );

    if (!open) return null;

    const panelWidth = Math.max(24, Math.min(maxWidth, columns - 4));

    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            width={columns}
            height={rows}
            justifyContent="center"
            alignItems="center"
        >
            <Box
                flexDirection="column"
                width={panelWidth}
                borderStyle="round"
                paddingX={2}
                paddingY={1}
                backgroundColor="#000000"
                {...panelProps}
            >
                {title ? (
                    <Box marginBottom={1} flexDirection="column">
                        <Text bold>{title}</Text>
                    </Box>
                ) : null}

                <Box flexDirection="column">{children}</Box>
            </Box>
        </Box>
    );
}

/* =========================================================
 * ConfirmDialog
 * ======================================================= */

export type ConfirmDialogProps = {
    open: boolean;
    title?: ReactNode;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    defaultFocus?: 'confirm' | 'cancel';
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
};

function ActionButton({
    label,
    focused,
    destructive = false,
    disabled = false,
}: {
    label: ReactNode;
    focused?: boolean;
    destructive?: boolean;
    disabled?: boolean;
}) {
    return (
        <Box borderStyle={focused ? 'round' : undefined} paddingX={1} paddingY={0} marginRight={1}>
            <Text bold={focused ?? false} dimColor={disabled ?? false}>
                {destructive ? `! ${label}` : label}
            </Text>
        </Box>
    );
}

export function ConfirmDialog({
    open,
    title = 'Confirm',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    defaultFocus = 'cancel',
    destructive = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [focused, setFocused] = useState<0 | 1>(defaultFocus === 'confirm' ? 0 : 1);
    const [busy, setBusy] = useState(false);
    const aliveRef = useRef(true);
    const stack = useContext(ModalStackContext);

    useEffect(() => {
        aliveRef.current = true;
        return () => {
            aliveRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!open) return;
        setFocused(defaultFocus === 'confirm' ? 0 : 1);
    }, [open, defaultFocus]);

    const runConfirm = useCallback(async () => {
        if (busy || loading) return;

        try {
            setBusy(true);
            await onConfirm();
        } finally {
            if (aliveRef.current) {
                setBusy(false);
            }
        }
    }, [busy, loading, onConfirm]);

    useInput(
        (_input, key) => {
            if (!open || busy || loading) return;

            if (key.escape) {
                onCancel();
                return;
            }

            if (key.leftArrow || (key.tab && key.shift)) {
                setFocused(1);
                return;
            }

            if (key.rightArrow || key.tab) {
                setFocused(0);
                return;
            }

            if (key.return) {
                if (focused === 0) {
                    void runConfirm();
                } else {
                    onCancel();
                }
            }
        },
        { isActive: open && (stack?.count ?? 0) <= 1 },
    );

    return (
        <Modal open={open} title={title} onRequestClose={onCancel}>
            {description ? (
                <Box marginBottom={1}>
                    <Text>{description}</Text>
                </Box>
            ) : null}

            <Box flexDirection="row" justifyContent="flex-end" marginTop={1}>
                <ActionButton
                    label={cancelLabel}
                    focused={focused === 1}
                    disabled={busy || loading}
                />
                <ActionButton
                    label={confirmLabel}
                    focused={focused === 0}
                    destructive={destructive}
                    disabled={busy || loading}
                />
            </Box>

            <Box marginTop={1}>
                <Text dimColor>Enter to confirm · Esc to dismiss · Tab to switch</Text>
            </Box>
        </Modal>
    );
}

/* =========================================================
 * Optional helper hook: promise-based confirm
 * ======================================================= */

export type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>;

export function useConfirmDialog() {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((next: ConfirmOptions) => {
        setOptions(next);
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const element = options ? (
        <ConfirmDialog
            open
            {...options}
            onConfirm={() => {
                resolverRef.current?.(true);
                resolverRef.current = null;
                setOptions(null);
            }}
            onCancel={() => {
                resolverRef.current?.(false);
                resolverRef.current = null;
                setOptions(null);
            }}
        />
    ) : null;

    return { confirm, element };
}

/* =========================================================
 * AlertDialog
 * ======================================================= */

export type AlertDialogProps = {
    open: boolean;
    title?: ReactNode;
    description?: ReactNode;
    buttonLabel?: ReactNode;
    onClose: () => void;
};

export function AlertDialog({
    open,
    title = 'Alert',
    description,
    buttonLabel = 'OK',
    onClose,
}: AlertDialogProps) {
    const stack = useContext(ModalStackContext);

    useInput(
        (_input, key) => {
            if (!open) return;
            if (key.escape || key.return) {
                onClose();
            }
        },
        { isActive: open && (stack?.count ?? 0) <= 1 },
    );

    return (
        <Modal open={open} title={title} onRequestClose={onClose}>
            {description ? (
                <Box marginBottom={1}>
                    <Text>{description}</Text>
                </Box>
            ) : null}

            <Box justifyContent="flex-end">
                <Box borderStyle="round" paddingX={1}>
                    <Text bold>{buttonLabel}</Text>
                </Box>
            </Box>

            <Box marginTop={1}>
                <Text dimColor>Enter to confirm · Esc to dismiss</Text>
            </Box>
        </Modal>
    );
}
