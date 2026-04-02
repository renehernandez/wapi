## MODIFIED Requirements

### Requirement: Add message to session
The system SHALL provide a resource route handler to add a message to a session. The handler SHALL receive `AppLoadContext` for DB/R2 access and `ctx.waitUntil()` for non-blocking DO notifications. It SHALL assign the next per-session seq, bump the account's global seq, write to R2 then D1, and notify DOs via `ctx.waitUntil()`.

#### Scenario: Add message via API
- **WHEN** the CLI sends `POST /api/messages` with `{ sessionId, role, content }`
- **THEN** the resource route action SHALL store the message, call `ctx.waitUntil(Promise.all([notifyUserRoom(...), notifySessionRoom(...)]))`, and return the created message immediately without waiting for notifications

### Requirement: Add messages in batch
The system SHALL provide a resource route handler to add multiple messages in a single request. The handler SHALL receive `AppLoadContext` for `ctx.waitUntil()`. It SHALL store all messages, then notify DOs once for the batch via `ctx.waitUntil()`.

#### Scenario: Batch add via API
- **WHEN** the CLI sends `POST /api/messages/batch` with `{ sessionId, messages: [...] }`
- **THEN** the resource route action SHALL store all messages, call `ctx.waitUntil()` with a single notification containing all messages, and return immediately

### Requirement: List messages for a session
The system SHALL provide a resource route loader to list messages for a session, ordered by seq ascending, with `afterSeq` and `limit` parameters.

#### Scenario: List messages via API
- **WHEN** the browser or CLI sends `GET /api/messages?sessionId=s_123&afterSeq=10`
- **THEN** the resource route loader SHALL return messages with seq > 10 ordered by seq ascending
