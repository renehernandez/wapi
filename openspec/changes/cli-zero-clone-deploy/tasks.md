## 1. Build Pipeline

- [ ] 1.1 Create `scripts/build.ts` — orchestrates: build app → copy Worker output → build CLI
- [ ] 1.2 Add copy step: `app/.output/` → `packages/cli/dist/worker-bundle/`
- [ ] 1.3 Add copy step: `app/db/migrations/` → `packages/cli/dist/worker-bundle/migrations/`
- [ ] 1.4 Update root `package.json` build script to use the orchestrator
- [ ] 1.5 Update CLI `package.json` `files` field to include `dist/worker-bundle/`
- [ ] 1.6 Verify `pnpm build` from root produces both CLI binary and worker-bundle
- [ ] 1.7 Verify `npm pack` in CLI package includes worker-bundle

## 2. Worker Bundle Resolution

- [ ] 2.1 Create `packages/cli/src/bundle.ts` — resolve worker-bundle path relative to CLI install location
- [ ] 2.2 Export helper functions: `getWorkerBundlePath()`, `getMigrationsPath()`, `getWranglerTemplate()`
- [ ] 2.3 Embed wrangler.jsonc template as a string constant (not a file read)
- [ ] 2.4 Write tests for bundle path resolution

## 3. Wrangler Scaffold

- [ ] 3.1 Create `packages/cli/src/deploy/scaffold.ts` — creates temp dir, writes wrangler.jsonc, copies Worker + migrations
- [ ] 3.2 Implement template substitution: replace DATABASE_ID_PLACEHOLDER and KV_ID_PLACEHOLDER with real IDs
- [ ] 3.3 Implement cleanup: delete temp dir on success or failure
- [ ] 3.4 Write tests for scaffold creation and template substitution

## 4. Rewrite Init Command

- [ ] 4.1 Add wrangler auth check: `wrangler whoami` before any resource creation
- [ ] 4.2 Rewrite D1 creation to work without a project directory
- [ ] 4.3 Rewrite KV creation to work without a project directory
- [ ] 4.4 Replace "generate wrangler.jsonc in project dir" with scaffold temp dir approach
- [ ] 4.5 Replace "wrangler deploy" in project dir with deploy from temp dir
- [ ] 4.6 Replace "wrangler d1 migrations apply" in project dir with apply from temp dir
- [ ] 4.7 Add resource cleanup info on failure (list what was created)
- [ ] 4.8 Update CF Access instructions to open browser to Zero Trust dashboard
- [ ] 4.9 Write tests for init flow: wrangler check, resource creation parsing, scaffold + deploy

## 5. Integration Verification

- [ ] 5.1 Verify `pnpm build` from root produces complete CLI with worker-bundle
- [ ] 5.2 Test `wapi init --help` shows updated description
- [ ] 5.3 Test full flow against a real CF account (manual verification)
