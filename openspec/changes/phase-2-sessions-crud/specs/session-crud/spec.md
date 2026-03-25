## ADDED Requirements

### Requirement: Create session
The system SHALL provide a server function to create a new session for the authenticated user. It SHALL generate a nanoid, set status to `active`, assign the current account seq, set version to 1, and return the created session.

#### Scenario: Create session with title and agent type
- **WHEN** an authenticated user calls createSession with `{ title: "Debug auth", agentType: "claude", machineId: "m_123" }`
- **THEN** the system SHALL create a session row, increment the account's global seq, and return the session with its assigned id and seq

#### Scenario: Create session with minimal fields
- **WHEN** an authenticated user calls createSession with `{}` (no title, no agentType)
- **THEN** the system SHALL create a session with null title and agentType, status `active`

### Requirement: Get session
The system SHALL provide a server function to retrieve a single session by ID, including the count of messages in that session. It SHALL only return sessions belonging to the authenticated user.

#### Scenario: Get existing session
- **WHEN** an authenticated user requests session `s_123` that belongs to their account
- **THEN** the system SHALL return the session with all fields plus `messageCount`

#### Scenario: Get nonexistent or other user's session
- **WHEN** an authenticated user requests a session that does not exist or belongs to another account
- **THEN** the system SHALL return null

### Requirement: List sessions
The system SHALL provide a server function to list sessions for the authenticated user with optional status filter and pagination.

#### Scenario: List all sessions
- **WHEN** an authenticated user calls listSessions with no filters
- **THEN** the system SHALL return sessions ordered by `updatedAt` descending

#### Scenario: List active sessions only
- **WHEN** an authenticated user calls listSessions with `{ status: "active" }`
- **THEN** the system SHALL return only sessions with status `active`

#### Scenario: Paginated listing
- **WHEN** an authenticated user calls listSessions with `{ limit: 10, offset: 20 }`
- **THEN** the system SHALL return at most 10 sessions starting from offset 20

### Requirement: Update session with optimistic concurrency
The system SHALL provide a server function to update a session's mutable fields (title, status, metadata). The caller SHALL provide `expectedVersion`. If the current version does not match, the update SHALL fail with a conflict error.

#### Scenario: Successful update
- **WHEN** an authenticated user calls updateSession with `{ id: "s_123", title: "New title", expectedVersion: 1 }`
- **THEN** the system SHALL update the title, increment version to 2, bump account seq, update `updatedAt`, and return the updated session

#### Scenario: Version conflict
- **WHEN** an authenticated user calls updateSession with `expectedVersion: 1` but the session's current version is 2
- **THEN** the system SHALL throw a conflict error and not modify the session

#### Scenario: End a session
- **WHEN** an authenticated user calls updateSession with `{ id: "s_123", status: "ended", expectedVersion: 3 }`
- **THEN** the system SHALL set status to `ended`, increment version, and return the updated session

### Requirement: Delete session (soft delete)
The system SHALL provide a server function to archive a session by setting its status to `archived`. This is a soft delete — the session remains in D1 but is excluded from default list queries.

#### Scenario: Archive a session
- **WHEN** an authenticated user calls deleteSession with `{ id: "s_123" }`
- **THEN** the system SHALL set the session's status to `archived` and bump account seq

#### Scenario: Archive already-archived session
- **WHEN** an authenticated user calls deleteSession on a session already in `archived` status
- **THEN** the system SHALL succeed idempotently (no error)
