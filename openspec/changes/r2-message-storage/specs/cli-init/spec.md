## MODIFIED Requirements

### Requirement: Provision Cloudflare resources
The `wapi init` command SHALL create the required Cloudflare resources: a D1 database named `wapi-db`, a KV namespace named `wapi-kv`, and an R2 bucket named `wapi-storage`. It SHALL use the `wrangler` CLI to create these resources. Each resource creation SHALL be idempotent — if the resource already exists, it SHALL be reused.

#### Scenario: First-time init on a fresh CF account
- **WHEN** the user runs `wapi init` and no WAPI resources exist on their CF account
- **THEN** the CLI SHALL create a D1 database, a KV namespace, and an R2 bucket, capture their IDs/names, and display them to the user

#### Scenario: Init with existing R2 bucket
- **WHEN** the user runs `wapi init` and an R2 bucket named `wapi-storage` already exists
- **THEN** the CLI SHALL detect the existing bucket and reuse it without error

#### Scenario: Wrangler not installed
- **WHEN** the user runs `wapi init` and `wrangler` is not found in PATH
- **THEN** the CLI SHALL display an error message with instructions to install wrangler and exit with a non-zero code

### Requirement: Generate wrangler.jsonc from template
The `wapi init` command SHALL generate `wrangler.jsonc` from the embedded template by substituting placeholder resource IDs with the real IDs. The template SHALL include the R2 bucket binding with `R2_BUCKET_PLACEHOLDER` replaced by the actual bucket name.

#### Scenario: Template includes R2 binding
- **WHEN** D1, KV, and R2 resources have been created successfully
- **THEN** the CLI SHALL generate `wrangler.jsonc` with the R2 bucket binding pointing to `wapi-storage`

#### Scenario: wrangler.jsonc already exists
- **WHEN** the user runs `wapi init` and `wrangler.jsonc` already contains non-placeholder IDs
- **THEN** the CLI SHALL prompt the user to confirm overwrite before proceeding

## ADDED Requirements

### Requirement: Store R2 bucket name in deployment state
The CLI SHALL persist the R2 bucket name in the deployment state file (`~/.config/wapi/deployment.json`) alongside existing resource IDs.

#### Scenario: Deployment state includes R2
- **WHEN** init completes successfully with R2 bucket `wapi-storage`
- **THEN** `~/.config/wapi/deployment.json` SHALL contain `"r2BucketName": "wapi-storage"`
