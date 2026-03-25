## ADDED Requirements

### Requirement: Atomic global seq increment
The system SHALL provide a function that atomically increments the `accounts.seq` counter and returns the new value. It SHALL use `UPDATE accounts SET seq = seq + 1 WHERE id = ? RETURNING seq`.

#### Scenario: Increment seq
- **WHEN** `incrementSeq(accountId)` is called for an account with seq=5
- **THEN** the function SHALL return 6 and the account's seq SHALL be 6 in D1

#### Scenario: Concurrent increments
- **WHEN** two mutations call `incrementSeq` concurrently for the same account
- **THEN** each SHALL receive a unique, sequential value (SQLite single-writer guarantees ordering)

### Requirement: Per-session message seq allocation
The system SHALL assign a monotonic seq to each message within a session. The seq SHALL be computed as `MAX(seq) + 1` for the session, with a UNIQUE constraint on `(sessionId, seq)` preventing duplicates.

#### Scenario: First message in session
- **WHEN** a message is added to a session with no existing messages
- **THEN** the assigned seq SHALL be 1

#### Scenario: Seq collision prevented
- **WHEN** two messages are inserted concurrently with the same computed seq
- **THEN** the UNIQUE constraint SHALL cause one to fail, and the system SHALL retry with the next seq

### Requirement: Account seq tracks all mutations
The global `accounts.seq` SHALL be incremented on every data mutation: session create, session update, session delete, and message add. The assigned seq value SHALL be stored on the created/modified record for sync purposes.

#### Scenario: Session created with seq
- **WHEN** a session is created and the account seq increments from 10 to 11
- **THEN** the session's `seq` field SHALL be 11

#### Scenario: Message created with accountSeq
- **WHEN** a message is added and the account seq increments from 15 to 16
- **THEN** the message's `accountSeq` field SHALL be 16
