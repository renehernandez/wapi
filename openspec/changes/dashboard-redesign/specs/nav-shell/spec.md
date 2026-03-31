## ADDED Requirements

### Requirement: Desktop top navigation bar
The system SHALL render a fixed top navigation bar on screens >= 640px (sm breakpoint). The bar SHALL have a slate-950 background with a bottom border. It SHALL contain: the "wappy" wordmark in monospace on the left, navigation links (Sessions, Devices) in the center, and the user's email on the right.

#### Scenario: Desktop nav renders
- **WHEN** the viewport is >= 640px
- **THEN** a fixed top nav bar SHALL be visible with wappy branding, nav links, and user email

#### Scenario: Active nav link
- **WHEN** the current route matches a nav link
- **THEN** that link SHALL be visually highlighted (cyan text or underline)

### Requirement: Mobile bottom tab bar
The system SHALL render a fixed bottom tab bar on screens < 640px. The tab bar SHALL contain 3 tabs: Sessions, Dashboard (home), and Devices. Each tab SHALL have an icon and label. The active tab SHALL be highlighted with cyan color.

#### Scenario: Mobile tab bar renders
- **WHEN** the viewport is < 640px
- **THEN** a fixed bottom tab bar SHALL be visible with 3 tabs and the top nav SHALL be hidden

#### Scenario: Active tab highlighting
- **WHEN** the current route matches a tab
- **THEN** that tab's icon and label SHALL display in cyan; inactive tabs SHALL be gray-500

### Requirement: Content area layout
The system SHALL render page content below the nav bar (desktop) or above the bottom tabs (mobile) with appropriate padding so content is not obscured by fixed navigation elements.

#### Scenario: Desktop content padding
- **WHEN** the page renders on desktop
- **THEN** content SHALL have top padding to clear the fixed nav bar

#### Scenario: Mobile content padding
- **WHEN** the page renders on mobile
- **THEN** content SHALL have bottom padding to clear the fixed bottom tab bar
