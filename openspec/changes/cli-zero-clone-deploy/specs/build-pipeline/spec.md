## ADDED Requirements

### Requirement: Root build orchestrates app then CLI
The root `pnpm build` SHALL build the app first (`vite build` in `app/`), then copy the Worker output to the CLI package, then build the CLI (`tsup`).

#### Scenario: Full build from root
- **WHEN** `pnpm build` is run at the monorepo root
- **THEN** it SHALL execute in order: (1) build app, (2) copy Worker output to CLI, (3) build CLI

#### Scenario: App build output exists after build
- **WHEN** the app build completes
- **THEN** `app/.output/` SHALL contain the compiled Worker and assets

### Requirement: Copy Worker output to CLI package
A build script SHALL copy `app/.output/` and `app/db/migrations/` into `packages/cli/dist/worker-bundle/` after the app builds.

#### Scenario: Worker files copied
- **WHEN** the copy script runs
- **THEN** `packages/cli/dist/worker-bundle/` SHALL contain the Worker output and `packages/cli/dist/worker-bundle/migrations/` SHALL contain the SQL files

### Requirement: CLI tsup build includes worker-bundle
The CLI's `tsup` build SHALL not modify or process the `worker-bundle/` directory — it stays as static files alongside the bundled CLI JavaScript.

#### Scenario: After CLI build
- **WHEN** `tsup` completes
- **THEN** `packages/cli/dist/index.js` (CLI) and `packages/cli/dist/worker-bundle/` (Worker) SHALL both exist

### Requirement: npm publish includes worker-bundle
The CLI's `package.json` SHALL include `dist/worker-bundle/` in the `files` field so it's published to npm.

#### Scenario: npm pack
- **WHEN** `npm pack` is run in `packages/cli/`
- **THEN** the tarball SHALL include `dist/worker-bundle/` with all Worker files and migrations
