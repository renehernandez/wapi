## ADDED Requirements

### Requirement: Get changes since seq
The system SHALL provide a server function `getChanges({ sinceSeq })` that returns all sessions and messages with an account seq greater than the provided value. This enables the CLI to incrementally sync data.

#### Scenario: Get all changes since seq 0
- **WHEN** an authenticated user calls getChanges with `{ sinceSeq: 0 }` and has 3 sessions and 10 messages
- **THEN** the system SHALL return all 3 sessions and all 10 messages plus the current account seq

#### Scenario: Get incremental changes
- **WHEN** an authenticated user calls getChanges with `{ sinceSeq: 15 }` and 2 sessions and 5 messages have seq > 15
- **THEN** the system SHALL return only those 2 sessions and 5 messages plus the current account seq

#### Scenario: No changes since seq
- **WHEN** an authenticated user calls getChanges with `{ sinceSeq: 20 }` and no data has seq > 20
- **THEN** the system SHALL return `{ sessions: [], messages: [], seq: 20 }`

### Requirement: Changes response format
The response SHALL be a flat structure with two arrays and a seq watermark: `{ sessions: Session[], messages: Message[], seq: number }`. Sessions and messages SHALL be separate arrays, not nested.

#### Scenario: Response structure
- **WHEN** getChanges returns data
- **THEN** the response SHALL have `sessions` (array of session objects), `messages` (array of message objects), and `seq` (the current account seq as a number)
