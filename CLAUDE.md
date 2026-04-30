# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
pnpm install          # postinstall hook enforces pnpm (only-allow) when IS_DEV exists
pnpm dev              # watch mode (tsdown --watch)
pnpm build            # production build (tsdown)
pnpm start            # run built output: node dist/cli.js
pnpm test             # placeholder (exits 0)
```

## Architecture

**Stack**: TypeScript + React (JSX) rendered in the terminal via [Ink 7](https://github.com/vadimdemedes/ink). Bundled as ESM-only for Node.js 24 with [tsdown](https://github.com/tsdown/tsdown).

**Entry points**:
- `src/cli.tsx` — CLI entry; renders `<App />` via Ink's `render()`
- `src/App.tsx` — root Ink component (currently a placeholder "Hello world")

**Module resolution**: Node.js ESM (`"nodenext"`). Use `.js` extensions for relative imports (TypeScript resolves them to `.ts`). No path aliases configured.

**Build output**: `tsdown.config.ts` bundles to `dist/cli.js`, minified, with DTS build enabled. `dist/` is gitignored.

## CI/CD

- **Publish** (`.github/workflows/publish.yml`): triggers on `v*` tags. Checks pnpm lockfile integrity, runs build, publishes to npm with provenance. Git tag determines npm dist tag (e.g., `v0.1.0-beta.1` → `--tag beta`).
- `.scripts/check-package-ver.sh` — validates `pnpm-lock.yaml` is current (runs `pnpm install --frozen-lockfile`)
- `.scripts/prepare-publish.sh` — derives `npm_dist_tag` from the git ref

## Important Constraints

- **pnpm only**: The `postinstall.js` script (active when `IS_DEV` file exists) runs `only-allow pnpm` to block npm/yarn usage.
- **Node 24+** expected in CI; local dev should use a compatible Node version.
- **No test framework** configured yet — `pnpm test` is a no-op.
