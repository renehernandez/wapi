## ADDED Requirements

### Requirement: Store message content in R2
The system SHALL store each session message as an individual R2 object. The R2 key format SHALL be `sessions/{sessionId}/msgs/{seq:06d}.json` where seq is zero-padded to 6 digits. The object body SHALL be a JSON document containing all message fields: id, sessionId, seq, role, content, metadata, accountSeq, and createdAt.

#### Scenario: Store a new message
- **WHEN** a message with sessionId "s_123", seq 1, role "user", and content "Hello" is stored
- **THEN** the system SHALL PUT an R2 object at key `sessions/s_123/msgs/000001.json` containing the full message JSON

#### Scenario: Store message with high seq number
- **WHEN** a message with seq 42 is stored
- **THEN** the R2 key SHALL be `sessions/{sessionId}/msgs/000042.json`

### Requirement: Read message content from R2
The system SHALL retrieve message content by constructing the R2 key from sessionId and seq, then performing an R2 GET.

#### Scenario: Read existing message
- **WHEN** the system requests the message at sessionId "s_123", seq 1
- **THEN** the system SHALL GET the R2 object at `sessions/s_123/msgs/000001.json` and parse the JSON body

#### Scenario: Read nonexistent message
- **WHEN** the system requests a message key that does not exist in R2
- **THEN** the system SHALL return null

### Requirement: Batch read messages from R2
The system SHALL support reading multiple messages for a session by listing R2 objects with a prefix and batch-fetching their contents.

#### Scenario: List all messages for a session
- **WHEN** the system lists messages for sessionId "s_123"
- **THEN** the system SHALL list R2 objects with prefix `sessions/s_123/msgs/` and return them ordered by key (lexicographic = seq order due to zero-padding)

#### Scenario: List messages after a seq
- **WHEN** the system lists messages for sessionId "s_123" after seq 10
- **THEN** the system SHALL list R2 objects with prefix `sessions/s_123/msgs/` and startAfter key `sessions/s_123/msgs/000010.json`, returning only messages with seq > 10

### Requirement: R2 bucket binding
The system SHALL use an R2 bucket binding named `R2` connected to a bucket named `wapi-storage`.

#### Scenario: R2 binding available in Worker
- **WHEN** the Worker starts
- **THEN** the `R2` binding SHALL be available via `env.R2` and point to the `wapi-storage` bucket
