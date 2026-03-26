## ADDED Requirements

### Requirement: Check wrangler is installed and authenticated
Before any resource creation, `wapi init` SHALL verify that `wrangler` is in PATH and the user is logged in to Cloudflare.

#### Scenario: Wrangler installed and logged in
- **WHEN** `wrangler whoami` succeeds
- **THEN** the init flow SHALL proceed

#### Scenario: Wrangler not installed
- **WHEN** `wrangler` is not found in PATH
- **THEN** the CLI SHALL display "wrangler is required. Install with: npm install -g wrangler" and exit

#### Scenario: Wrangler not logged in
- **WHEN** `wrangler whoami` fails with an auth error
- **THEN** the CLI SHALL display "Not logged in to Cloudflare. Run: wrangler login" and exit

### Requirement: Create D1 database
`wapi init` SHALL create a D1 database named `wapi-db` via `wrangler d1 create wapi-db` and capture the database ID from the output.

#### Scenario: D1 created successfully
- **WHEN** `wrangler d1 create wapi-db` succeeds
- **THEN** the CLI SHALL parse the `database_id` from the output and use it for deployment

#### Scenario: D1 creation fails
- **WHEN** `wrangler d1 create` fails (e.g., name conflict)
- **THEN** the CLI SHALL display the error and exit

### Requirement: Create KV namespace
`wapi init` SHALL create a KV namespace via `wrangler kv namespace create` and capture the namespace ID.

#### Scenario: KV created successfully
- **WHEN** the KV namespace is created
- **THEN** the CLI SHALL parse the namespace ID and use it for deployment

### Requirement: Scaffold temp directory and deploy
`wapi init` SHALL create a temporary directory, write `wrangler.jsonc` with real resource IDs, copy the bundled Worker output and migrations into it, and run `wrangler deploy` from that directory.

#### Scenario: Successful deployment
- **WHEN** all resources are created and the temp directory is scaffolded
- **THEN** `wrangler deploy` SHALL run in the temp directory and the CLI SHALL capture the deployed Worker URL

#### Scenario: Deployment fails
- **WHEN** `wrangler deploy` fails
- **THEN** the CLI SHALL display the error, list what resources were created (for manual cleanup), and exit

### Requirement: Apply D1 migrations remotely
After deployment, `wapi init` SHALL apply D1 migrations to the remote database via `wrangler d1 migrations apply wapi-db --remote` from the temp directory.

#### Scenario: Migrations applied
- **WHEN** deployment succeeds
- **THEN** the CLI SHALL run `wrangler d1 migrations apply` and confirm all migrations applied

### Requirement: Save config and display instructions
After successful deployment, `wapi init` SHALL save the deployed URL to `~/.config/wapi/config.json` and display instructions for configuring Cloudflare Access.

#### Scenario: Init complete
- **WHEN** deployment and migrations succeed
- **THEN** the CLI SHALL save `serverUrl`, display the CF Access setup steps, and suggest running `wapi auth`

### Requirement: Clean up temp directory
The temp directory SHALL be removed after deployment completes (success or failure).

#### Scenario: Cleanup on success
- **WHEN** deployment succeeds
- **THEN** the temp directory SHALL be deleted

#### Scenario: Cleanup on failure
- **WHEN** deployment fails
- **THEN** the temp directory SHALL still be deleted (resources may remain on CF — user is informed)
