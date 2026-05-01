import { registerCommand } from './registry.ts';
import { exitCommand } from './exit/exit.ts';
import { versionCommand } from './version/version.ts';
import { helpCommand } from './help/help.ts';
import { aboutCommand } from './about/about.ts';
import { setupCommand } from './setup/setup.ts';
import { providerCommand } from './provider/provider.ts';
import { modelCommand } from './model/model.ts';

registerCommand(exitCommand);
registerCommand(versionCommand);
registerCommand(helpCommand);
registerCommand(aboutCommand);
registerCommand(setupCommand);
registerCommand(providerCommand);
registerCommand(modelCommand);
