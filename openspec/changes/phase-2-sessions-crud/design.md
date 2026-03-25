## Context

WAPI Phase 1 delivered auth (CF Access + device tokens), device management, and the CLI scaffold. The server has D1 with `accounts`, `machines`, and `device_codes` tables. The CLI can authenticate but `wapi run` is a stub — no session capture or sync.

Phase 2 adds the core data: sessions and messages. This is what transforms WAPI from an auth scaffold into a useful product. The CLI will eventually capture sessions and POST messages here; the browser will display them.

Server-trusted model (plaintext in D1). Single-tenant per CF account. TanStack Start server functions with `createServerFn` + `inputValidator`.

## Goals / Non-Goals

**Goals:**
- Sessions table with full CRUD + status lifecycle (active → ended → archived)
- Messages table with per-session seq ordering
- Global account seq for CLI sync ordering
- Optimistic concurrency on session updates
- Sync endpoint for CLI catch-up (`getChanges`)
- Session list and detail UI routes
- Dashboard shows recent sessions

**Non-Goals:**
- CLI session capture wiring (future CLI change)
- Real-time updates via Durable Objects (Phase 3)
- Session search or full-text indexing
- Message editing or deletion
- File attachments or artifacts (Phase 5)

## Decisions

### 1. Soft delete via status column instead of DELETE

**Choice**: Sessions are never hard-deleted. `deleteSession` sets `status = 'archived'`. List queries filter by status.

**Alternatives considered**:
- *Hard delete with CASCADE*: Simpler but irreversible. Users may want to recover sessions.
- *Soft delete via `deletedAt` column*: Separate column from status. Adds complexity — status and deletedAt can conflict.

**Rationale**: Status already has a lifecycle (`active` → `ended` → `archived`). Archive is the natural "delete" action. No extra column needed.

### 2. Per-session seq vs global seq for messages

**Choice**: Messages have a per-session `seq` (monotonic within a session) AND mutations bump the global `accounts.seq`. The per-session seq orders messages within a session. The global seq enables sync ("what changed since seq N?").

**Alternatives considered**:
- *Global seq only*: Every message gets a global seq. Simpler but creates contention on the accounts row for concurrent sessions.
- *Timestamps for ordering*: Use `createdAt`. But timestamps can collide and aren't monotonic.

**Rationale**: Per-session seq is simple (MAX + 1 with unique constraint) and has no contention across sessions. Global seq is bumped once per mutation for sync.

### 3. Atomic seq increment via SQL RETURNING

**Choice**: `UPDATE accounts SET seq = seq + 1 WHERE id = ? RETURNING seq` — single atomic statement, returns the new value.

**Alternatives considered**:
- *SELECT then UPDATE*: Race condition between read and write.
- *D1 transaction*: D1 supports implicit transactions but not explicit BEGIN/COMMIT. The single UPDATE is already atomic.

**Rationale**: SQLite guarantees single-statement atomicity. `RETURNING` avoids a second query. This is the simplest correct approach.

### 4. Optimistic concurrency via version column

**Choice**: `UPDATE sessions SET ..., version = version + 1 WHERE id = ? AND version = ?`. If zero rows affected, throw a conflict error (HTTP 409).

**Alternatives considered**:
- *Last-write-wins*: Simplest but can silently lose data.
- *ETag-based*: Use HTTP ETag headers. More REST-ful but TanStack Start server functions aren't REST.

**Rationale**: Version column is standard optimistic concurrency. The caller passes `expectedVersion` and gets a clear error on conflict.

### 5. getChanges returns flat arrays, not nested

**Choice**: `getChanges({ sinceSeq })` returns `{ sessions: [...], messages: [...], seq: currentSeq }` — two flat arrays plus the current seq watermark.

**Alternatives considered**:
- *Nested: sessions with their messages*: More natural for display but expensive to assemble and transfers duplicate session data if only messages changed.
- *Streaming / pagination*: More complex. Not needed until data volumes justify it.

**Rationale**: Flat arrays are simple to produce (two queries), simple to consume (CLI processes each array), and efficient (no duplication). The CLI can join them client-side if needed.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| D1 `RETURNING` clause support | SQLite supports RETURNING since 3.35. D1 is built on recent SQLite. Tested in Phase 1 with Drizzle. |
| Large message volumes in getChanges | Add `limit` parameter. For Phase 2, volumes are small (single user). Pagination in Phase 3+. |
| Per-session seq MAX+1 race | UNIQUE constraint on (sessionId, seq) prevents duplicates. On conflict, retry with new MAX. |
| Drizzle ORM ALTER TABLE for adding seq column | Use raw SQL migration for the ALTER TABLE. Drizzle Kit handles new tables fine. |
