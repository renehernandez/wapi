## ADDED Requirements

### Requirement: Worker bundle included in CLI package
The CLI npm package SHALL include the pre-built Worker output at `dist/worker-bundle/`. This directory SHALL contain the compiled Worker JavaScript, static assets, and D1 migration SQL files.

#### Scenario: CLI package contains Worker bundle
- **WHEN** the CLI npm package is published and installed globally
- **THEN** `dist/worker-bundle/` SHALL exist and contain the Worker entry point, assets, and migration files

#### Scenario: Worker bundle matches CLI version
- **WHEN** the CLI is at version `0.1.0`
- **THEN** the bundled Worker SHALL be built from the same commit and be functionally compatible

### Requirement: Migration files bundled
The CLI package SHALL include D1 migration SQL files at `dist/worker-bundle/migrations/`. These files SHALL be the same ones in `app/db/migrations/`.

#### Scenario: Migrations available in bundle
- **WHEN** the CLI is installed
- **THEN** `dist/worker-bundle/migrations/` SHALL contain all `.sql` migration files and the `meta/_journal.json`

### Requirement: Bundle path resolution
The CLI SHALL resolve the Worker bundle path relative to its own installation directory, not the current working directory. This SHALL work regardless of where the user runs `wapi init`.

#### Scenario: Init from any directory
- **WHEN** the user runs `wapi init` from `/home/user/projects/myapp`
- **THEN** the CLI SHALL find the Worker bundle at its own package's `dist/worker-bundle/` path
