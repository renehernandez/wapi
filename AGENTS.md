# WAPI Agent Instructions

## Project

WAPI is a PWA for syncing AI coding sessions across devices, built on Cloudflare Workers. Monorepo with three packages:

- `app/` — TanStack Start on Cloudflare Workers (D1, KV, Durable Objects)
- `packages/cli/` — CLI for provisioning, auth, and session capture (Node.js, citty)
- `packages/wire/` — Shared Zod schemas for API contracts

## Stack

- **Runtime**: Cloudflare Workers (D1, KV, Durable Objects, partyserver)
- **Framework**: TanStack Start (React, SSR, server functions)
- **ORM**: Drizzle ORM (SQLite/D1)
- **CLI**: citty, execa, consola
- **Testing**: Vitest 4.1 + @cloudflare/vitest-pool-workers
- **Linting**: Biome
- **Build**: tsup (CLI), vite (app)
- **Node**: 24 (via mise, .tool-versions)
- **Package manager**: pnpm workspaces

## Development

- Run `pnpm dev` for local development
- Run `pnpm test` for all tests (server + CLI)
- Run `pnpm lint` for Biome linting
- Run `pnpm typecheck` for TypeScript checking
- Run `pnpm build` for full build (app + CLI with Worker bundle)
- Lefthook pre-commit runs lint, typecheck, and test automatically

## Key Patterns

- Server functions use `createServerFn` with `inputValidator` (TanStack Start)
- Bindings accessed via `import { env } from "cloudflare:workers"`
- DB functions accept a `db` parameter with default `getDb()` for testability
- Tests use `applyMigrations()` from `~/test/apply-migrations.ts` for D1 schema setup
- `cloudflare:workers` mock resolved via vitest alias for CF pool tests

## OpenSpec

This project uses OpenSpec for spec-driven development. Changes go through:
`/opsx:propose` → `/opsx:apply` → `/opsx:archive`

Specs live in `openspec/specs/`, archived changes in `openspec/changes/archive/`.
