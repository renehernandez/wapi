## ADDED Requirements

### Requirement: Session list route
The system SHALL serve a route at `/sessions` that displays the authenticated user's sessions in a list. The list SHALL support filtering by status and be ordered by most recently updated.

#### Scenario: View session list
- **WHEN** an authenticated user navigates to `/sessions`
- **THEN** the system SHALL display sessions with title, agent type, status, message count, and last updated time

#### Scenario: Filter by status
- **WHEN** an authenticated user selects the "active" filter on the sessions page
- **THEN** the system SHALL display only sessions with status `active`

#### Scenario: Empty session list
- **WHEN** an authenticated user has no sessions
- **THEN** the system SHALL display a message indicating no sessions exist

### Requirement: Session detail route
The system SHALL serve a route at `/sessions/$sessionId` that displays a session's metadata and its message thread.

#### Scenario: View session with messages
- **WHEN** an authenticated user navigates to `/sessions/s_123` and the session has 5 messages
- **THEN** the system SHALL display the session title, status, and all 5 messages ordered by seq

#### Scenario: View session belonging to another account
- **WHEN** an authenticated user navigates to a session that does not belong to their account
- **THEN** the system SHALL display a "not found" message

### Requirement: Dashboard shows recent sessions
The dashboard route (`/`) SHALL display the 5 most recently updated sessions for the authenticated user, in addition to the existing device list.

#### Scenario: Dashboard with sessions
- **WHEN** an authenticated user visits `/` and has 10 sessions
- **THEN** the system SHALL display the 5 most recently updated sessions with title, status, and last updated time

#### Scenario: Dashboard with no sessions
- **WHEN** an authenticated user visits `/` and has no sessions
- **THEN** the system SHALL display the device list and a message that no sessions exist yet
