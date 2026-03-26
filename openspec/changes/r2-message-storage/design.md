## Context

WAPI stores session messages in D1 with full content inline (~2–50 KB per row). As user count grows, the 10 GB per-database limit becomes a bottleneck. The `session_messages` table is append-heavy and read-as-batch — a pattern well-suited to object storage.

Currently, the CLI's `/api/` REST endpoints have no HTTP handlers. The server functions (`addMessage`, `listMessages`, `getChanges`, etc.) exist and are tested, but there are no TanStack Start API file routes to expose them over HTTP. The CLI's `api.ts` client calls these missing endpoints.

The app has D1 (`DB` binding), KV (`KV` binding), and two Durable Objects (`UserRoom`, `SessionRoom`). No R2 bucket exists yet.

## Goals / Non-Goals

**Goals:**
- Move message content to R2 to keep D1 small and within limits long-term
- Retain D1 as a lightweight sync index so incremental sync (`getChanges`) remains a simple SQL query
- Implement the missing REST API routes the CLI depends on
- Add R2 bucket provisioning to `wapi init`

**Non-Goals:**
- Message search or filtering by content (no full-text search in R2)
- Data migration tooling (no production data exists)
- Message retention policies or TTL (future concern)
- Changing the Durable Object notification flow (already sends full content inline)
- E2E encryption of message content in R2

## Decisions

### 1. One R2 object per message (not per session)

**Choice:** Each message is a separate R2 object at `sessions/{sessionId}/msgs/{seq:06d}.json`.

**Alternatives considered:**
- *One object per session (append-only JSON array)*: Simpler read path but requires read-modify-write on every append. Gets slow for sessions with hundreds of messages. No concurrent write safety.
- *Chunked (N messages per object)*: Balanced but adds complexity tracking chunk boundaries. Premature optimization.

**Rationale:** Individual objects give O(1) writes (single PUT), natural ordering via zero-padded keys, and R2 `list({ prefix })` for session-scoped reads. 6-digit padding supports up to 999,999 messages per session.

### 2. Lightweight D1 index (not content-free)

**Choice:** D1 keeps a minimal row per message: `id`, `sessionId`, `seq`, `accountSeq`. No content, metadata, role, or timestamps.

**Alternatives considered:**
- *Drop D1 entirely for messages*: Requires rethinking sync. R2 has no `WHERE account_seq > N` equivalent — would need to scan all sessions.
- *Full duplicate in D1*: D1 grows just as fast as before, defeating the purpose.
- *Metadata-only in D1 (keep role, createdAt)*: Marginal benefit. Role and createdAt are only used at display time, when we fetch from R2 anyway.

**Rationale:** The index is ~60 bytes per row vs ~2–50 KB with content. D1 stays small for years. Sync queries remain a simple `SELECT ... WHERE account_seq > ?`.

### 3. R2-first write order

**Choice:** On message creation: allocate seqs in D1 → R2.put() → D1 INSERT index row.

**Rationale:** If R2 succeeds but D1 fails, we have an orphaned R2 object (harmless, no dangling references). If D1 index succeeded first but R2 failed, reads would find an index entry pointing to missing content. R2-first is the safer failure mode.

Seq allocation happens first (before either write) because both R2 key and D1 row need the seq value. The `nextMessageSeq` + `incrementSeq` calls are atomic in D1.

### 4. TanStack Start API file routes for REST

**Choice:** Use `createAPIFileRoute` in `app/src/routes/api/` to implement REST endpoints.

**Alternatives considered:**
- *Direct Worker fetch handler*: Bypasses TanStack Start, loses middleware/context integration.
- *Reuse existing server functions via RPC*: The CLI can't call TanStack Start server functions directly — they require the full SSR request context.

**Rationale:** API file routes are the TanStack Start way to expose plain HTTP endpoints. They integrate with the existing app and share the same Worker bindings.

### 5. Device token auth on REST routes

**Choice:** REST routes authenticate via `Authorization: Bearer device:<token>` header, looking up the device token in the `machines` table.

**Rationale:** This matches the existing CLI auth flow. The same `authenticateDevice` helper used in server functions works here. CF Access JWT auth is also supported for browser-originated API calls.

## Risks / Trade-offs

**[Dual-write consistency]** → R2 and D1 are not transactional. A crash between R2.put() and D1 INSERT creates an orphaned R2 object. Mitigation: orphans are harmless (no index = never read), and client retries with the same seq are idempotent.

**[Read amplification]** → Listing N messages requires 1 D1 query + N R2 GETs. Mitigation: R2 GETs within the same Worker invocation are fast (same-datacenter). Batch reads with `Promise.all()`. For typical session sizes (50–200 messages), this is acceptable.

**[R2 eventual consistency]** → R2 has strong read-after-write consistency for new objects, so a PUT followed by GET in the same or subsequent request always returns the latest data. Not a risk for this use case.

**[No content search]** → Moving content out of D1 means we can't `WHERE content LIKE '%...'`. Mitigation: content search was never implemented and is a non-goal.

## Migration Plan

1. Add R2 bucket binding to `app/wrangler.jsonc` and CLI embedded template
2. Generate new Drizzle migration to drop `content`, `metadata`, `role` from `session_messages`
3. Update Drizzle schema to match
4. Update server functions to dual-write and read from R2
5. Add REST API file routes
6. Update `wapi init` to create R2 bucket
7. Deploy — no data migration needed (greenfield)

**Rollback:** Revert the deployment. Since there's no production data, rollback is a clean redeploy of the previous version.

## Open Questions

- None — all decisions resolved during brainstorming.
