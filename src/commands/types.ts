export interface CommandContext {
    exit: () => void;
    showAlert: (props: { title: string; description?: string }) => void;
    showConfig?: () => void;
    showProviderSelect?: () => void;
    showModelSelect?: () => void;
}

export interface Command {
    name: string;
    description: string;
    execute: (ctx: CommandContext, rest: string) => void;
}
