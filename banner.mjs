import { readFile } from 'node:fs/promises'

const pkg = JSON.parse(await readFile('package.json', 'utf8'))

export default [
  '/*!',
  ` * ${pkg.name} v${pkg.version} — ${pkg.description}`,
  ` * SPDX-License-Identifier: ${pkg.license}`,
  ` * Copyright (c) ${pkg.author}`,
  ` * ${pkg.homepage}`,
  ' */',
].join('\n')
