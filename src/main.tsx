import { parseArgs } from 'node:util';
import { initAppDir, checkVersion } from './data/dirs.js';
import { initConversation } from './data/loader.js';
import { startApp } from './ui.tsx';

export async function main(argc: number, argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    (await import('./cli/help.ts')).printHelp();
    return 0;
  }

  // 1. 初始化应用数据目录
  initAppDir();
  checkVersion();

  // 2. 加载对话
  const rawInput = positionals[0] ?? null;
  initConversation(rawInput);

  // 3. 启动 REPL
  await startApp();
  return 0;
}
