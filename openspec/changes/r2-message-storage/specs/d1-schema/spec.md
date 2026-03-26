## MODIFIED Requirements

### Requirement: Session messages table
The system SHALL maintain a `session_messages` table in D1 as a lightweight sync index with columns: `id` (TEXT PRIMARY KEY, nanoid), `sessionId` (TEXT NOT NULL, FK to sessions.id), `seq` (INTEGER NOT NULL), `accountSeq` (INTEGER NOT NULL). The table SHALL have a UNIQUE constraint on `(sessionId, seq)`. The `content`, `metadata`, `role`, and `createdAt` columns SHALL be removed — this data lives in R2.

#### Scenario: Create session_messages index table via migration
- **WHEN** the migration is applied
- **THEN** the `session_messages` table SHALL have only `id`, `session_id`, `seq`, and `account_seq` columns with the unique index on `(session_id, seq)`

## REMOVED Requirements

### Requirement: session_messages content column
**Reason**: Message content moved to R2 object storage to reduce D1 storage footprint.
**Migration**: Content is stored in R2 at `sessions/{sessionId}/msgs/{seq:06d}.json`.

### Requirement: session_messages metadata column
**Reason**: Metadata moved to R2 alongside content.
**Migration**: Metadata is included in the R2 message object.

### Requirement: session_messages role column
**Reason**: Role is only used at display time, when the full R2 object is already fetched.
**Migration**: Role is included in the R2 message object.

### Requirement: session_messages createdAt column
**Reason**: Timestamp only needed at display time, available in the R2 object.
**Migration**: createdAt is included in the R2 message object.
