## Why

Today, deploying WAPI requires cloning the repo, installing dependencies, manually creating D1/KV resources, editing wrangler.jsonc, building the app, and running wrangler deploy. This is too many steps for a user who just wants to sync their AI coding sessions. The CLI should be the single entry point: `npm install -g wapi && wapi init` should go from zero to deployed with no repo clone, no build tools, and no config file editing.

## What Changes

- Bundle the pre-built Worker output (`.output/` from `vite build`) inside the CLI npm package at `dist/worker-bundle/`
- Rewrite `wapi init` to deploy from the bundled Worker — no repo clone needed
- Init flow: check wrangler installed + logged in → create D1 → create KV → scaffold temp directory with wrangler.jsonc + bundled Worker + migrations → `wrangler deploy` → `wrangler d1 migrations apply --remote` → save URL to config → display CF Access instructions → clean up temp dir
- Add a build pipeline script that builds the app, then copies the output into the CLI package before `tsup` bundles the CLI
- Update `wrangler.template.jsonc` to be usable as a programmatic template with placeholder substitution
- Remove the requirement for users to have the repo cloned or any source code present

## Capabilities

### New Capabilities
- `worker-bundle`: Pre-built Worker output bundled inside the CLI npm package. Includes compiled JS, static assets, and D1 migrations. Versioned with the CLI.
- `init-deploy`: Zero-clone init flow — creates CF resources, scaffolds a temp deployment directory, deploys via wrangler, applies migrations, saves config. User goes from `npm install -g wapi` to running instance in one command.
- `build-pipeline`: Monorepo build script that builds the app first, then copies output into the CLI package before the CLI build. Ensures the Worker bundle is always in sync with the CLI version.
- `wrangler-scaffold`: Programmatic scaffolding of a temp directory with wrangler.jsonc (real resource IDs), the Worker bundle, and migrations. Clean up after deploy.

### Modified Capabilities
- `cli-init`: Complete rewrite from shelling out to wrangler in the project directory to deploying from bundled Worker in a temp dir

## Impact

- **CLI package**: Ships with `dist/worker-bundle/` containing the compiled Worker. npm package size increases by ~1-2MB.
- **Build pipeline**: New `scripts/build-all.ts` or root `pnpm build` that orchestrates app build → CLI build in sequence.
- **Init command**: Complete rewrite. No longer assumes project directory exists. Works from any directory after global install.
- **wrangler dependency**: Still required for users (they're deploying to CF). But only needs to be installed globally, not in a project.
- **Template**: `wrangler.template.jsonc` moves into the CLI package as a programmatic asset, not a file in the app directory.
- **Migrations**: D1 migration SQL files bundled with the CLI so `wrangler d1 migrations apply` works from the temp directory.
