## ADDED Requirements

### Requirement: Session search input
The sessions list page SHALL provide a search input at the top that filters sessions by title. The input SHALL have a slate-800 background, slate-700 border, and placeholder text "Search sessions...".

#### Scenario: Search filters sessions
- **WHEN** the user types in the search input
- **THEN** the session list SHALL filter to show only sessions whose title contains the search text (case-insensitive)

#### Scenario: Empty search
- **WHEN** the search input is empty
- **THEN** all sessions (matching the current status filter) SHALL be displayed

### Requirement: Card-based session list
The system SHALL render sessions as dark cards (slate-800 bg, slate-700 border, rounded-lg) instead of a flat divided list. Each card SHALL display: session title (monospace, gray-100), agent type badge (cyan), relative timestamp, status dot, and message count.

#### Scenario: Session card layout
- **WHEN** a session renders in the list
- **THEN** it SHALL display as a card with title, agent badge, relative time, status dot, and message count

#### Scenario: Card hover state
- **WHEN** the user hovers over a session card
- **THEN** the card border SHALL transition to slate-600

### Requirement: Relative timestamps
The system SHALL display session timestamps as relative time strings (e.g., "2h ago", "yesterday", "Mar 27") using `Intl.RelativeTimeFormat` or equivalent logic. Full timestamps SHALL NOT be shown in the card view.

#### Scenario: Recent session timestamp
- **WHEN** a session was updated 2 hours ago
- **THEN** the timestamp SHALL display as "2h ago" or similar relative format

#### Scenario: Old session timestamp
- **WHEN** a session was updated more than 7 days ago
- **THEN** the timestamp SHALL display as a short date (e.g., "Mar 27")

### Requirement: Status filter restyling
The status filter buttons SHALL be restyled as a segmented control with dark theme styling. The active segment SHALL have a distinct background (slate-700 or similar) to indicate selection.

#### Scenario: Active filter segment
- **WHEN** the user selects a status filter
- **THEN** that segment SHALL display with a highlighted background

### Requirement: Empty state
The system SHALL display a terminal-style empty state when no sessions match: monospace text in gray-500 reading `> No sessions found. Run "wappy run claude" to start one.`

#### Scenario: No sessions
- **WHEN** the session list is empty (no sessions or no search matches)
- **THEN** the terminal-style empty state message SHALL be displayed

### Requirement: Mobile session cards
On mobile (< 640px), session cards SHALL be full-width with minimum 48px touch targets for tappable areas.

#### Scenario: Mobile card tap target
- **WHEN** a session card renders on a mobile viewport
- **THEN** the card link area SHALL have a minimum height of 48px
