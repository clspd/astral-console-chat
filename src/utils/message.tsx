import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Box, Text, useWindowSize } from 'ink';

type MessageType = 'info' | 'success' | 'warning' | 'error';

type MessageOptions = {
    content: React.ReactNode;
    type?: MessageType;
    duration?: number; // ms, 0 = 永不自动关闭
};

type MessageItem = Required<MessageOptions> & {
    id: number;
};

type MessageApi = {
    show: (options: MessageOptions) => number;
    info: (content: React.ReactNode, duration?: number) => number;
    success: (content: React.ReactNode, duration?: number) => number;
    warning: (content: React.ReactNode, duration?: number) => number;
    error: (content: React.ReactNode, duration?: number) => number;
    destroy: (id?: number) => void;
};

const MessageContext = createContext<MessageApi | null>(null);

function getIcon(type: MessageType): string {
    switch (type) {
        case 'success':
            return '✓';
        case 'warning':
            return '!';
        case 'error':
            return '✖';
        case 'info':
        default:
            return 'ℹ';
    }
}

function clampText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
}

function MessageRow({ item }: { item: MessageItem }) {
    const icon = getIcon(item.type);

    return (
        <Box marginBottom={1} justifyContent="center" width="100%">
            <Box
                borderStyle="round"
                paddingX={1}
                paddingY={0}
                flexDirection="row"
                alignItems="center"
            >
                <Text bold>{icon}</Text>
                <Text> </Text>
                <Text>
                    {typeof item.content === 'string' ||
                    typeof item.content === 'number' ||
                    typeof item.content === 'boolean'
                        ? clampText(item.content)
                        : item.content}
                </Text>
            </Box>
        </Box>
    );
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const { columns } = useWindowSize();
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const nextIdRef = useRef(1);
    const timersRef = useRef(new Map<number, NodeJS.Timeout>());

    const destroy = useCallback((id?: number) => {
        setMessages((prev) => {
            if (typeof id === 'number') {
                const timer = timersRef.current.get(id);
                if (timer) {
                    clearTimeout(timer);
                    timersRef.current.delete(id);
                }
                return prev.filter((item) => item.id !== id);
            }

            for (const timer of timersRef.current.values()) {
                clearTimeout(timer);
            }
            timersRef.current.clear();
            return [];
        });
    }, []);

    const show = useCallback((options: MessageOptions) => {
        const id = nextIdRef.current++;
        const item: MessageItem = {
            id,
            type: options.type ?? 'info',
            content: options.content,
            duration: options.duration ?? 2000,
        };

        setMessages((prev) => [item, ...prev].slice(0, 5));

        if (item.duration > 0) {
            const timer = setTimeout(() => {
                setMessages((prev) => prev.filter((m) => m.id !== id));
                timersRef.current.delete(id);
            }, item.duration);

            timersRef.current.set(id, timer);
        }

        return id;
    }, []);

    useEffect(() => {
        return () => {
            for (const timer of timersRef.current.values()) {
                clearTimeout(timer);
            }
            timersRef.current.clear();
        };
    }, []);

    const api = useMemo<MessageApi>(
        () => ({
            show,
            info: (content, duration) =>
                show(
                    duration !== undefined
                        ? { type: 'info', content, duration }
                        : { type: 'info', content },
                ),
            success: (content, duration) =>
                show(
                    duration !== undefined
                        ? { type: 'success', content, duration }
                        : { type: 'success', content },
                ),
            warning: (content, duration) =>
                show(
                    duration !== undefined
                        ? { type: 'warning', content, duration }
                        : { type: 'warning', content },
                ),
            error: (content, duration) =>
                show(
                    duration !== undefined
                        ? { type: 'error', content, duration }
                        : { type: 'error', content },
                ),
            destroy,
        }),
        [destroy, show],
    );

    return (
        <MessageContext.Provider value={api}>
            <Box flexDirection="column" width={columns}>
                <Box flexDirection="column" width="100%" paddingX={1} paddingTop={1}>
                    {messages.map((item) => (
                        <MessageRow key={item.id} item={item} />
                    ))}
                </Box>

                <Box flexDirection="column" flexGrow={1} width="100%">
                    {children}
                </Box>
            </Box>
        </MessageContext.Provider>
    );
}

export function useMessage() {
    const ctx = useContext(MessageContext);
    if (!ctx) {
        throw new Error('useMessage must be used inside <MessageProvider>');
    }
    return ctx;
}
