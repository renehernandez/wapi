## ADDED Requirements

### Requirement: Generate wrangler.jsonc with real resource IDs
The CLI SHALL generate a `wrangler.jsonc` file from a template, substituting placeholder values with the real D1 database ID and KV namespace ID.

#### Scenario: Template substitution
- **WHEN** D1 ID is `abc-123` and KV ID is `def-456`
- **THEN** the generated `wrangler.jsonc` SHALL have `"database_id": "abc-123"` and `"id": "def-456"`

### Requirement: Temp directory structure
The scaffolded temp directory SHALL contain: `wrangler.jsonc`, the Worker output files (matching `.output/` structure), and `db/migrations/` with all SQL files and journal.

#### Scenario: Temp directory contents
- **WHEN** the temp directory is scaffolded
- **THEN** it SHALL have the structure wrangler expects for `wrangler deploy`: the entry point, assets, and migration files

### Requirement: Template embedded in CLI
The wrangler.jsonc template SHALL be embedded in the CLI source code (as a string or a file in the package), not read from the user's filesystem.

#### Scenario: Template available after global install
- **WHEN** the CLI is installed globally via npm
- **THEN** the template SHALL be accessible without any files from the wapi repo being present on disk
