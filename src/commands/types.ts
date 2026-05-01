export interface CommandContext {
  exit: () => void;
}

export interface Command {
  name: string;
  description: string;
  execute: (ctx: CommandContext) => void;
}
