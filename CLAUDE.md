# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
pnpm install          # postinstall hook enforces pnpm (only-allow) when IS_DEV file exists
pnpm dev              # watch mode (tsdown --watch)
pnpm build            # production build (tsdown)
pnpm start            # run built output: node dist/cli.js
pnpm test             # placeholder (exits 0 — no test framework configured yet)
```

## Architecture

**Stack**: TypeScript + React (JSX) rendered in the terminal via [Ink 7](https://github.com/vadimdemedes/ink). Bundled as ESM-only for Node.js 24 with [tsdown](https://github.com/tsdown/tsdown).

**Module resolution**: Node.js ESM (`"nodenext"`). Relative imports use `.js` extensions (TypeScript resolves them to `.ts`). Path alias `@/*` → `./src/*` is configured in tsconfig.json but not yet used in source.

### Entry & startup flow

1. `src/bootstrap.tsx` — CLI entry (has `#!/usr/bin/env node` shebang). Calls `main()` from `main.tsx`.
2. `src/main.tsx` — Parses CLI args with `node:util` `parseArgs`. Supports `--help`. Orchestrates: init app data dir → check version → load/create conversation → start Ink render loop.
3. `src/ui.tsx` — Wraps Ink's `render(<App />, { alternateScreen: true })` and awaits `waitUntilExit()`.
4. `src/App.tsx` — Root Ink component. Shows title bar, `<MessageList />`, and `<InputBox />`. Handles message submission by appending a `Message` to the conversation store.

### Data & persistence

- `src/data/dirs.ts` — App data lives at `%APPDATA%/astral-console-chat` (Windows) or `~/.config/astral-console-chat` (POSIX). Contains `_chats/` subdirectory, `settings.json`, `preferences.json`, and `._version` file.
- `src/data/loader.ts` — Loads conversations from JSON files. Resolution order: (1) direct file path, (2) `_chats/<name>.json`, (3) create empty conversation in `_chats/`.

### State management

- `src/state/store.ts` — Minimal custom store (no external dependency). Provides `getState`, `setState(updater)`, `subscribe`. Equivalent to a single-slice Zustand store.
- `src/state/conversation.ts` — Defines `ConversationState` and the singleton `conversationStore`.
- `src/state/useConversation.ts` — React hook wrapping `useSyncExternalStore` to bridge the custom store into Ink components.

### Type system

- `src/types/conversation.ts` — Core domain types: `Conversation`, `MessageContainer`, `Message`, `MessageFragment`, `FileAttachmentInfo`. Enums for `SchemaVersion`, `MessageRole`, `MessageStatus`, `MessageFeedback`, `MessageFeatureType`.

### UI components

- `src/ui/InputBox.tsx` — Terminal text input with cursor positioning, supports backspace/delete/arrow keys/home/end and multi-byte characters (Chinese etc.).
- `src/ui/MessageList.tsx` — Renders conversation messages with role-colored labels.

## CI/CD

- **Publish** (`.github/workflows/publish.yml`): triggers on `v*` tags. Checks pnpm lockfile integrity, runs build, publishes to npm with provenance. Git tag determines npm dist tag (e.g., `v0.1.0-beta.1` → `--tag beta`).
- `.scripts/check-package-ver.sh` — validates `pnpm-lock.yaml` is current (`pnpm install --frozen-lockfile`).
- `.scripts/prepare-publish.sh` — derives `npm_dist_tag` from the git ref.

## Constraints

- **pnpm only**: `postinstall.js` (active when `IS_DEV` file exists) runs `only-allow pnpm` to block npm/yarn.
- **Node 24+** expected in CI; local dev should use a compatible Node version.
- **AGPL-3.0** licensed.
