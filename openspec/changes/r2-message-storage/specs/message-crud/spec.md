## MODIFIED Requirements

### Requirement: Add message to session
The system SHALL provide a server function to add a message to a session. It SHALL assign the next per-session seq (MAX(seq) + 1) and bump the account's global seq. It SHALL then store the full message as an R2 object at `sessions/{sessionId}/msgs/{seq:06d}.json`, then insert a lightweight index row (id, sessionId, seq, accountSeq) into D1. It SHALL return the created message.

#### Scenario: Add first message to a session
- **WHEN** an authenticated user adds a message with `{ sessionId: "s_123", role: "user", content: "Hello" }` to a session with no messages
- **THEN** the system SHALL create a message with seq=1, store it in R2 at `sessions/s_123/msgs/000001.json`, insert the index row in D1, and return it

#### Scenario: Add subsequent message
- **WHEN** a session already has 5 messages (seq 1-5) and a new message is added
- **THEN** the system SHALL assign seq=6, store in R2, and insert the index row in D1

#### Scenario: Add message to nonexistent session
- **WHEN** an authenticated user adds a message to a session that does not exist or belongs to another account
- **THEN** the system SHALL throw an error

#### Scenario: R2 put succeeds but D1 insert fails
- **WHEN** the R2 object is written successfully but the D1 index insert fails
- **THEN** the system SHALL return an error to the client (the orphaned R2 object is harmless)

### Requirement: List messages for a session
The system SHALL provide a server function to list messages for a session, ordered by seq ascending. It SHALL query the D1 index for message IDs and seqs, then batch-fetch full message content from R2. It SHALL support seq-based pagination via `afterSeq` and `limit` parameters.

#### Scenario: List all messages
- **WHEN** an authenticated user calls listMessages with `{ sessionId: "s_123" }`
- **THEN** the system SHALL query D1 for index rows, fetch content from R2 for each, and return all messages ordered by seq ascending

#### Scenario: List messages after a seq (for sync)
- **WHEN** an authenticated user calls listMessages with `{ sessionId: "s_123", afterSeq: 10 }`
- **THEN** the system SHALL return only messages with seq > 10, content fetched from R2

#### Scenario: List messages with limit
- **WHEN** an authenticated user calls listMessages with `{ sessionId: "s_123", limit: 50 }`
- **THEN** the system SHALL return at most 50 messages

### Requirement: Get single message
The system SHALL provide a server function to retrieve a single message by ID within a session. It SHALL look up the message ID in the D1 index to get the sessionId and seq, then fetch the full message from R2.

#### Scenario: Get existing message
- **WHEN** an authenticated user requests message `m_456` in session `s_123`
- **THEN** the system SHALL return the message with all fields fetched from R2

#### Scenario: Get nonexistent message
- **WHEN** an authenticated user requests a message that does not exist
- **THEN** the system SHALL return null
