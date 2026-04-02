## MODIFIED Requirements

### Requirement: Create session
The system SHALL provide a route action or resource route handler to create a new session. The handler SHALL receive `AppLoadContext` for DB access and `ctx.waitUntil()` for non-blocking DO notifications. It SHALL generate a nanoid, set status to `active`, assign the current account seq, set version to 1, and return the created session.

#### Scenario: Create session via API
- **WHEN** the CLI sends `POST /api/sessions` with `{ agentType: "claude", machineId: "m_123" }`
- **THEN** the resource route action SHALL create the session, call `ctx.waitUntil(notifyUserRoom(...))`, and return the session with id and version

### Requirement: Update session with optimistic concurrency
The system SHALL provide a route action or resource route handler to update a session's mutable fields. The handler SHALL receive `AppLoadContext` for DB access and `ctx.waitUntil()`.

#### Scenario: End a session via API
- **WHEN** the CLI sends `POST /api/sessions/:id` with `{ status: "ended", expectedVersion: 3 }`
- **THEN** the resource route action SHALL update the session, call `ctx.waitUntil(notifyUserRoom(...))`, and return the updated session
