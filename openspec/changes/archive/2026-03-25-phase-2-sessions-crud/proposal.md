## Why

WAPI has auth, device management, and a CLI — but no session data. Sessions are the core value: the CLI captures AI coding sessions and syncs them to the server so users can view them from any browser. Without sessions and messages CRUD, the CLI's `wapi run` is a stub and the dashboard has nothing to show.

## What Changes

- Add `sessions` and `session_messages` tables to D1 via Drizzle ORM migration
- Add `seq` column to `accounts` table for global monotonic ordering (used by CLI sync)
- Implement server functions for full session lifecycle: create, get, list, update (with optimistic concurrency), soft-delete
- Implement server functions for messages: add, list (with seq-based pagination), get
- Implement `getChanges` sync endpoint: returns all sessions and messages since a given seq (for CLI catch-up)
- Add UI routes: `/sessions` (list with status filters), `/sessions/$sessionId` (detail with message thread)
- Update dashboard (`/`) to show recent sessions
- Optimistic concurrency on session updates via `version` column
- Atomic seq allocation via `UPDATE ... SET seq = seq + 1 RETURNING seq`

## Capabilities

### New Capabilities
- `session-crud`: Session lifecycle management — create, read, update, list, soft-delete with status transitions and optimistic concurrency
- `message-crud`: Session message storage — add messages with per-session seq ordering, list with seq-based pagination, get individual messages
- `seq-allocator`: Monotonic sequence allocation — global account seq for sync ordering, per-session message seq for ordering, atomic increment via SQL RETURNING
- `sync-endpoint`: CLI sync endpoint — returns sessions and messages changed since a given seq number, enabling incremental catch-up
- `session-routes`: Session UI routes — session list page with status filters, session detail page with message thread, dashboard updated with recent sessions

### Modified Capabilities
- `d1-schema`: Adding sessions, session_messages tables and seq column to accounts

## Impact

- **D1 schema**: New migration adding 2 tables + 1 column modification
- **Server functions**: 9 new server functions in `server/functions/sessions.ts` and `server/functions/messages.ts`
- **Routes**: 2 new routes (`/sessions`, `/sessions/$sessionId`), 1 modified route (`/` dashboard)
- **Wire package**: New Zod schemas for session and message request/response types
- **CLI**: The `getChanges` endpoint enables future CLI session sync (not wired up in this change — that's CLI Phase 2)
- **Existing code**: No breaking changes. Auth middleware unchanged. Device management unchanged.
