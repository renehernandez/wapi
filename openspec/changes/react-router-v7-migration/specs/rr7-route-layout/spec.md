## ADDED Requirements

### Requirement: Root layout with auth and WebSocket listeners
The root layout SHALL check authentication via a server-side loader, render the NavShell, and mount the UserRoomListener for real-time notifications. Unauthenticated users SHALL see the layout without WebSocket connections.

#### Scenario: Authenticated user loads any page
- **WHEN** an authenticated user navigates to any route
- **THEN** the root layout SHALL render NavShell with the user's email and mount a UserRoomListener connected to their account's UserRoom DO

#### Scenario: Unauthenticated user loads any page
- **WHEN** an unauthenticated user navigates to any route
- **THEN** the root layout SHALL render NavShell without a user email and SHALL NOT mount UserRoomListener

### Requirement: UserRoomListener triggers router invalidation
The UserRoomListener SHALL connect to the UserRoom DO via PartySocket and invalidate the router when session-level events occur (session_created, session_updated, message_added).

#### Scenario: New session created
- **WHEN** the UserRoom broadcasts a `session_created` event
- **THEN** the UserRoomListener SHALL call `router.invalidate()` to refresh active loaders

#### Scenario: Session status changes
- **WHEN** the UserRoom broadcasts a `session_updated` event
- **THEN** the UserRoomListener SHALL call `router.invalidate()`
