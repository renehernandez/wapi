# Development Rules

## Testing Requirements

Every code change MUST be accompanied by corresponding tests. This is non-negotiable.

- New functions → unit tests covering happy path and edge cases
- New server functions → integration tests with real D1 via Cloudflare vitest pool
- New CLI commands → tests with mocked dependencies
- Bug fixes → regression test that fails before the fix and passes after
- Refactors → existing tests must continue to pass; add tests if coverage gaps are found

## Test Location Conventions

- Server tests: `app/src/server/**/__tests__/*.test.ts`
- Integration tests: `app/src/__tests__/*.test.ts`
- CLI tests: `packages/cli/src/__tests__/*.test.ts`

## Test Infrastructure

- Server tests use `@cloudflare/vitest-pool-workers` (runs in Workers runtime)
- Server tests call `applyMigrations()` in `beforeAll` to set up D1 schema
- CLI tests use standard vitest (Node.js runtime)
- Mock `cloudflare:workers` via vitest alias for CF pool tests

## Pre-commit Checks

Lefthook runs on every commit:
1. `pnpm lint` — Biome check (formatting + linting)
2. `pnpm typecheck` — TypeScript strict mode across all packages
3. `pnpm test` — All tests must pass

Do not bypass these checks. If a check fails, fix the issue rather than skipping the hook.
