export interface AppContext {
    exit: () => void;
    showAlert: (props: { title: string; description?: string }) => void;
    message: {
        success: (content: string, duration?: number) => void;
        warning: (content: string, duration?: number) => void;
    };
    showConfig: () => void;
    showProviderSelect: () => void;
    showModelSelect: () => void;
}

export interface Command {
    name: string;
    description: string;
    description2?: string;
    execute: (ctx: AppContext, rest: string) => void | Promise<void>;
}
