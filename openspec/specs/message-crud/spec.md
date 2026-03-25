## ADDED Requirements

### Requirement: Add message to session
The system SHALL provide a server function to add a message to a session. It SHALL assign the next per-session seq (MAX(seq) + 1), bump the account's global seq, and return the created message.

#### Scenario: Add first message to a session
- **WHEN** an authenticated user adds a message with `{ sessionId: "s_123", role: "user", content: "Hello" }` to a session with no messages
- **THEN** the system SHALL create a message with seq=1 and return it

#### Scenario: Add subsequent message
- **WHEN** a session already has 5 messages (seq 1-5) and a new message is added
- **THEN** the system SHALL assign seq=6 to the new message

#### Scenario: Add message to nonexistent session
- **WHEN** an authenticated user adds a message to a session that does not exist or belongs to another account
- **THEN** the system SHALL throw an error

### Requirement: List messages for a session
The system SHALL provide a server function to list messages for a session, ordered by seq ascending. It SHALL support seq-based pagination via `afterSeq` and `limit` parameters.

#### Scenario: List all messages
- **WHEN** an authenticated user calls listMessages with `{ sessionId: "s_123" }`
- **THEN** the system SHALL return all messages ordered by seq ascending

#### Scenario: List messages after a seq (for sync)
- **WHEN** an authenticated user calls listMessages with `{ sessionId: "s_123", afterSeq: 10 }`
- **THEN** the system SHALL return only messages with seq > 10

#### Scenario: List messages with limit
- **WHEN** an authenticated user calls listMessages with `{ sessionId: "s_123", limit: 50 }`
- **THEN** the system SHALL return at most 50 messages

### Requirement: Get single message
The system SHALL provide a server function to retrieve a single message by ID within a session.

#### Scenario: Get existing message
- **WHEN** an authenticated user requests message `m_456` in session `s_123`
- **THEN** the system SHALL return the message with all fields

#### Scenario: Get nonexistent message
- **WHEN** an authenticated user requests a message that does not exist
- **THEN** the system SHALL return null
