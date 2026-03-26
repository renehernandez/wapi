## ADDED Requirements

### Requirement: POST /api/sessions creates a session
The system SHALL expose a `POST /api/sessions` REST endpoint that creates a new session. It SHALL accept device token authentication via `Authorization: Bearer device:<token>` header.

#### Scenario: Create session with device token
- **WHEN** an authenticated device sends `POST /api/sessions` with body `{ title: "My Session", agentType: "claude" }`
- **THEN** the system SHALL create a session and return it with status 201

#### Scenario: Unauthenticated request
- **WHEN** a request to `POST /api/sessions` has no valid Authorization header
- **THEN** the system SHALL return 401

### Requirement: GET /api/sessions lists sessions
The system SHALL expose a `GET /api/sessions` REST endpoint that returns all sessions for the authenticated account.

#### Scenario: List sessions
- **WHEN** an authenticated device sends `GET /api/sessions`
- **THEN** the system SHALL return all sessions for the account ordered by updatedAt descending

#### Scenario: No sessions exist
- **WHEN** an authenticated device sends `GET /api/sessions` and the account has no sessions
- **THEN** the system SHALL return an empty array

### Requirement: POST /api/sessions/:id updates a session
The system SHALL expose a `POST /api/sessions/:id` REST endpoint that updates an existing session (e.g., marking it as ended).

#### Scenario: End a session
- **WHEN** an authenticated device sends `POST /api/sessions/s_123` with body `{ status: "ended" }`
- **THEN** the system SHALL update the session status and return the updated session

#### Scenario: Update nonexistent session
- **WHEN** an authenticated device sends `POST /api/sessions/nonexistent`
- **THEN** the system SHALL return 404

### Requirement: POST /api/messages adds a message
The system SHALL expose a `POST /api/messages` REST endpoint that adds a message to a session using dual-write (R2 content + D1 index).

#### Scenario: Add message via REST
- **WHEN** an authenticated device sends `POST /api/messages` with body `{ sessionId: "s_123", role: "assistant", content: "Hello" }`
- **THEN** the system SHALL store the message in R2, insert the index row in D1, notify DOs, and return the message with status 201

#### Scenario: Add message to nonexistent session
- **WHEN** an authenticated device sends `POST /api/messages` with a sessionId that doesn't exist
- **THEN** the system SHALL return 404

### Requirement: GET /api/messages lists messages
The system SHALL expose a `GET /api/messages` REST endpoint that lists messages for a session, reading the D1 index then fetching content from R2.

#### Scenario: List messages for a session
- **WHEN** an authenticated user sends `GET /api/messages?sessionId=s_123`
- **THEN** the system SHALL return all messages with full content from R2, ordered by seq ascending

#### Scenario: List messages with afterSeq
- **WHEN** an authenticated user sends `GET /api/messages?sessionId=s_123&afterSeq=5`
- **THEN** the system SHALL return only messages with seq > 5

### Requirement: GET /api/sync returns incremental changes
The system SHALL expose a `GET /api/sync` REST endpoint that returns sessions and messages changed since a given seq watermark.

#### Scenario: Sync from beginning
- **WHEN** an authenticated user sends `GET /api/sync?sinceSeq=0`
- **THEN** the system SHALL return all sessions, all messages (with R2 content), and the current account seq

#### Scenario: Incremental sync
- **WHEN** an authenticated user sends `GET /api/sync?sinceSeq=15`
- **THEN** the system SHALL return only sessions and messages with account_seq > 15

### Requirement: REST routes authenticate via device token or CF Access
All `/api/` REST routes SHALL support authentication via either device token (`Authorization: Bearer device:<token>`) or CF Access JWT (`CF-Access-JWT-Assertion` header). The authentication logic SHALL reuse the existing auth helpers.

#### Scenario: Device token auth
- **WHEN** a request includes `Authorization: Bearer device:tok_abc123`
- **THEN** the system SHALL look up the token in the `machines` table and resolve the account

#### Scenario: CF Access JWT auth
- **WHEN** a request includes a valid `CF-Access-JWT-Assertion` header
- **THEN** the system SHALL validate the JWT and resolve the account
