import { registerCommand } from './registry.ts';
import { exitCommand } from './exit/exit.ts';
import { versionCommand } from './version/version.ts';
import { helpCommand } from './help/help.ts';
import { aboutCommand } from './about/about.ts';

registerCommand(exitCommand);
registerCommand(versionCommand);
registerCommand(helpCommand);
registerCommand(aboutCommand);
