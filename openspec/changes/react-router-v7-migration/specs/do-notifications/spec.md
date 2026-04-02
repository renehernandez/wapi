## MODIFIED Requirements

### Requirement: Notify UserRoom after mutations
Server code that mutates session data (createSession, updateSession, deleteSession, addMessage) SHALL notify the user's UserRoom DO after writing to D1. The notification SHALL use `env.UserRoom.idFromName()` / `env.UserRoom.get()` to get the DO stub. The `stub.fetch()` call SHALL be wrapped in `ctx.waitUntil()` for non-blocking execution — the response returns immediately while the notification completes in the background.

#### Scenario: Session created notification
- **WHEN** `createSession` writes a new session to D1
- **THEN** it SHALL call `ctx.waitUntil(notifyUserRoom(...))` with `{ type: "session_created", sessionId, title }`

#### Scenario: Message added notification
- **WHEN** `addMessage` writes a new message to D1
- **THEN** it SHALL call `ctx.waitUntil(notifyUserRoom(...))` with `{ type: "message_added", sessionId, messageSeq }`

### Requirement: Notify SessionRoom after message mutations
Server code that adds messages SHALL notify the session's SessionRoom DO with full message content. The `stub.fetch()` call SHALL be wrapped in `ctx.waitUntil()`.

#### Scenario: Message added to SessionRoom
- **WHEN** `addMessage` writes a new message to D1
- **THEN** it SHALL call `ctx.waitUntil(notifySessionRoom(...))` with the full message data `{ type: "message", id, seq, role, content, metadata, createdAt }`

### Requirement: Notification failure tolerance
DO notification failures SHALL NOT cause the server function to fail. The D1 write is the source of truth; DO notifications are best-effort.

#### Scenario: DO unavailable
- **WHEN** server code writes to D1 successfully but the DO notification fails
- **THEN** the notification promise (inside `waitUntil`) SHALL catch the error and log it. The response SHALL already have been returned successfully.
