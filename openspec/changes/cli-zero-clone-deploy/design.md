## Context

WAPI's CLI can authenticate devices and capture sessions, but deploying the server requires cloning the repo and running manual wrangler commands. The goal is `npm install -g wapi && wapi init` — zero to deployed in two commands.

The app builds to `.output/` via `vite build` (Cloudflare's vite plugin produces a Worker-ready bundle). Wrangler can deploy this output given a `wrangler.jsonc` with the right bindings. The key insight: we can bundle this output in the npm package and deploy it from a temp directory at init time.

## Goals / Non-Goals

**Goals:**
- `npm install -g wapi && wapi init` deploys a working WAPI instance
- No git clone, no pnpm install, no vite build for the user
- D1 database, KV namespace created automatically
- Migrations applied to the remote D1
- Deployed Worker URL saved to local config
- CF Access setup guided (can't be automated via wrangler)
- Worker bundle versioned with CLI (always in sync)

**Non-Goals:**
- Automating CF Access setup (requires Zero Trust dashboard)
- Custom domain configuration (users do this in CF dashboard)
- Upgrading an existing deployment (defer — first version is fresh deploys only)
- Multi-account support (one CF account per CLI install)

## Decisions

### 1. Bundle Worker output in npm package, not fetch from GitHub

**Choice**: The CLI npm package includes the pre-built `.output/` directory as `dist/worker-bundle/`. No network fetch at init time (beyond wrangler's own calls).

**Alternatives considered**:
- *Fetch release from GitHub*: Smaller npm package but adds a network dependency, versioning complexity, and a release pipeline.
- *Clone and build on user's machine*: Most flexible but requires Node, pnpm, and a potentially failing build step.

**Rationale**: Bundling ensures the Worker is always the exact version that matches the CLI. No extra network calls. npm package size increases by ~1-2MB — acceptable for a CLI tool.

### 2. Temp directory for deployment, not persistent project directory

**Choice**: `wapi init` creates a temp directory, scaffolds wrangler.jsonc + Worker files, runs `wrangler deploy`, then cleans up. No persistent project directory on the user's machine.

**Alternatives considered**:
- *Persistent project directory*: Create `~/.wapi/project/` with the Worker files. User can modify and re-deploy. But then we need to handle updates, conflicts, and stale state.
- *Deploy via CF API directly*: Skip wrangler entirely. More complex — must handle multipart upload, binding metadata, migration application without wrangler.

**Rationale**: Temp directory is clean — no stale state to manage. The CLI owns the deployment lifecycle. If the user wants to customize, they clone the repo. The temp dir approach is what tools like `create-cloudflare` use internally.

### 3. Wrangler required, not embedded

**Choice**: `wapi init` requires `wrangler` in PATH. The CLI checks and gives a clear error if missing.

**Alternatives considered**:
- *Ship wrangler as a dependency*: Guaranteed version but massive dependency tree (200+ packages).
- *Use `npx wrangler`*: No global install needed but slower (downloads each time) and version unpredictable.

**Rationale**: Users deploying to CF already have wrangler. If not, `npm install -g wrangler` is one command. The CLI checks on startup and exits early with instructions.

### 4. Build pipeline: app first, then copy output, then CLI build

**Choice**: Root `pnpm build` runs: (1) `vite build` in `app/`, (2) copy `.output/` to `packages/cli/src/worker-bundle/`, (3) `tsup` in `packages/cli/`. The bundled Worker files are included via tsup's `publicDir` or a copy script.

**Alternatives considered**:
- *tsup copies at build time*: Use tsup's `onSuccess` hook to copy. Tight coupling between build tools.
- *Symlink*: Link `packages/cli/dist/worker-bundle` → `app/.output`. Breaks on npm publish (symlinks not followed).

**Rationale**: Explicit copy step is simple and deterministic. The root build script orchestrates the order. `tsup` doesn't need to know about the Worker — it just bundles the CLI, and the copy script ensures the Worker files are in the right place.

### 5. Migrations bundled as SQL files

**Choice**: The CLI package includes `dist/worker-bundle/migrations/*.sql` alongside the Worker output. `wapi init` copies them to the temp directory so `wrangler d1 migrations apply` can find them.

**Alternatives considered**:
- *Apply migrations via D1 API*: Read SQL files and execute them directly via the D1 HTTP API. No wrangler needed for migrations. But must handle the migration journal.
- *Embed in Worker*: Worker auto-migrates on first request. Complex and fragile.

**Rationale**: Wrangler handles migration journaling and idempotency. Bundling the SQL files is simple — they're just text files alongside the Worker bundle.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| npm package size increases | ~1-2MB for Worker bundle + migrations. Acceptable for a CLI tool. Monitor with `npm pack --dry-run`. |
| Wrangler version compatibility | Pin minimum wrangler version in docs. Test against latest stable. Parse output defensively. |
| CF Access can't be automated | Clear step-by-step instructions printed after deploy. Link to CF dashboard. Consider opening browser to the right page. |
| Temp dir deploy fails mid-way | Log each step. On failure, print what was created (so user can clean up manually) and what remains to be done. |
| Worker bundle gets stale vs CLI | Build pipeline enforces: app builds first, then CLI. Version mismatch is impossible within a release. |
