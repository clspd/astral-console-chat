#!/usr/bin/env node
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isDev = existsSync(join(__dirname, 'IS_DEV'))
const onlyAllowPath = join(__dirname, 'node_modules', '.bin', 'only-allow')
const onlyAllowExists = existsSync(onlyAllowPath)

const execConfig = {
  cwd: __dirname,
  stdio: 'inherit'
}

if (isDev && onlyAllowExists) {
  execSync(`"${onlyAllowPath}" pnpm`, execConfig);
  console.log('Good');
}

if (isDev) execSync('node prepare.mjs', execConfig);


