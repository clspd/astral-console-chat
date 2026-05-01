export interface CommandContext {
    exit: () => void;
    showAlert: (props: { title: string; description?: string }) => void;
}

export interface Command {
    name: string;
    description: string;
    execute: (ctx: CommandContext) => void;
}
