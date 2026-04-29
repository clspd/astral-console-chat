#!/usr/bin/env node
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isDev = existsSync(join(__dirname, 'IS_DEV'))
const onlyAllowPath = join(__dirname, 'node_modules', '.bin', 'only-allow')
const onlyAllowExists = existsSync(onlyAllowPath)

if (isDev && onlyAllowExists) {
  execSync(`"${onlyAllowPath}" pnpm`, {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('Good');
}
