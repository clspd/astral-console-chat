import { app_name } from '@/config.ts';
import { DYNDATA } from '@/dynamic.ts';
import type { Command } from '../types.ts';

const command: Command = {
    name: 'test-error',
    description: 'Raise an error',
    execute(ctx, _rest) {
        throw new Error('error');
    },
};

export default command;
