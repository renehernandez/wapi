## MODIFIED Requirements

### Requirement: Accounts table
The `accounts` table SHALL include a `seq` column (`INTEGER DEFAULT 0`) that serves as a global monotonic counter for sync ordering. The column SHALL be added via a D1 migration.

#### Scenario: Account created with default seq
- **WHEN** a new account is created
- **THEN** the `seq` column SHALL default to `0`

#### Scenario: Seq incremented on mutation
- **WHEN** any session or message mutation occurs for an account
- **THEN** the account's `seq` SHALL be atomically incremented and the new value returned

## ADDED Requirements

### Requirement: Sessions table
The system SHALL maintain a `sessions` table in D1 with columns: `id` (TEXT PRIMARY KEY, nanoid), `accountId` (TEXT NOT NULL, FK to accounts.id), `title` (TEXT), `agentType` (TEXT), `machineId` (TEXT, FK to machines.id), `status` (TEXT NOT NULL, CHECK in 'active','ended','archived'), `metadata` (TEXT, JSON), `version` (INTEGER DEFAULT 1), `seq` (INTEGER NOT NULL), `createdAt` (TEXT, ISO8601), `updatedAt` (TEXT, ISO8601).

#### Scenario: Create sessions table via migration
- **WHEN** the migration is applied
- **THEN** the `sessions` table SHALL exist with all columns, constraints, and an index on `accountId`

### Requirement: Session messages table
The system SHALL maintain a `session_messages` table in D1 with columns: `id` (TEXT PRIMARY KEY, nanoid), `sessionId` (TEXT NOT NULL, FK to sessions.id), `seq` (INTEGER NOT NULL), `role` (TEXT NOT NULL, CHECK in 'user','assistant','system','tool'), `content` (TEXT NOT NULL), `metadata` (TEXT, JSON), `accountSeq` (INTEGER NOT NULL), `createdAt` (TEXT, ISO8601). The table SHALL have a UNIQUE constraint on `(sessionId, seq)`.

#### Scenario: Create session_messages table via migration
- **WHEN** the migration is applied
- **THEN** the `session_messages` table SHALL exist with all columns, constraints, and a unique index on `(sessionId, seq)`
