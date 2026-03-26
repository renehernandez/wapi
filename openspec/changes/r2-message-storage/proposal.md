## Why

Session message content stored in D1 will exhaust the 10 GB per-database limit quickly as user count grows (50 users ≈ 1 year to hit the cap). Message bodies (2–50 KB each) dominate storage while only needing key-based access, making them a natural fit for R2 object storage. Additionally, the REST API routes (`/api/sessions`, `/api/messages`, `/api/sync`) that the CLI depends on have no HTTP handlers — only the underlying server functions exist.

## What Changes

- **Move message content to R2**: Store full message JSON as individual R2 objects keyed by `sessions/{sessionId}/msgs/{seq:06d}.json`. D1 retains a lightweight index row per message (id, sessionId, seq, accountSeq) for sync queries.
- **Dual-write on message creation**: R2 put first (full message), then D1 insert (index row). R2-first ordering ensures no dangling index entries on partial failure.
- **Update read paths**: `listMessages` and `getChanges` query D1 index for ordering/filtering, then batch `R2.get()` for content.
- **Add R2 bucket to infrastructure**: New `wapi-storage` R2 bucket binding in wrangler config. `wapi init` creates the bucket idempotently alongside D1/KV.
- **Implement REST API routes**: Add TanStack Start API file routes for `GET/POST /api/sessions`, `POST /api/messages`, `GET /api/messages`, and `GET /api/sync` with device token auth.
- **Schema migration**: Drop `content`, `metadata`, and `role` columns from `session_messages` table. **BREAKING** — no production data exists, so this is a clean schema change.

## Capabilities

### New Capabilities
- `r2-message-store`: R2 object storage for message content with one-object-per-message pattern and batch read support.
- `rest-api-routes`: TanStack Start API file routes (`/api/sessions`, `/api/messages`, `/api/sync`) with device token authentication.

### Modified Capabilities
- `message-crud`: Write path becomes dual-write (R2 + D1 index). Read path fetches content from R2 after querying D1 index.
- `sync-endpoint`: `getChanges` returns D1 index rows enriched with R2 content via batch get.
- `d1-schema`: `session_messages` table drops `content`, `metadata`, and `role` columns — becomes a lightweight sync index.
- `cli-init`: `wapi init` creates an R2 bucket (`wapi-storage`) and includes it in the wrangler template. Deployment state tracks `r2BucketName`.

## Impact

- **Server functions**: `addMessage`, `listMessages`, `getMessage`, `getChanges` all change to use R2 for content.
- **Drizzle schema**: `session_messages` table loses 3 columns, new D1 migration required.
- **Wrangler config**: New `r2_buckets` binding in both `app/wrangler.jsonc` and the CLI's embedded template.
- **CLI init**: New R2 bucket creation step, updated deployment state type.
- **Wire schemas**: `AddMessageRequest` and `MessageResponse` unchanged (contract stays the same), but transport layer shifts.
- **DO notifications**: Unchanged — already send full message content inline.
- **PWA UI**: Session detail page reads from updated `listMessages` — transparent change.
- **Tests**: Server tests need R2 mock/binding. CLI init tests need R2 bucket creation coverage.
