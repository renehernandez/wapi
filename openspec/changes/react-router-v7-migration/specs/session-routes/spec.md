## MODIFIED Requirements

### Requirement: Session list route
The system SHALL serve a route at `/sessions` that displays the authenticated user's sessions in a list. The route SHALL use a React Router `loader` function that receives `AppLoadContext` and queries D1 via `context.cloudflare.env.DB`. The list SHALL support filtering by status and be ordered by most recently updated.

#### Scenario: View session list
- **WHEN** an authenticated user navigates to `/sessions`
- **THEN** the loader SHALL fetch sessions from D1 and the component SHALL display them with title, agent type, status, and last updated time

### Requirement: Session detail route
The system SHALL serve a route at `/sessions/$sessionId` that displays a session's metadata and its message thread. The route SHALL use a React Router `loader` function that receives `AppLoadContext`.

#### Scenario: View session with messages
- **WHEN** an authenticated user navigates to `/sessions/s_123` and the session has 5 messages
- **THEN** the loader SHALL fetch the session and messages, and the component SHALL display them ordered by seq
