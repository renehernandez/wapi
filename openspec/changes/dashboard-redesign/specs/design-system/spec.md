## ADDED Requirements

### Requirement: Dark terminal color palette
The system SHALL define a dark terminal color palette via Tailwind v4 `@theme` CSS custom properties: slate-950 for page background, slate-900 for surfaces, slate-800 for cards, slate-700 for borders, emerald for active/success states, cyan for links/accents, amber for warnings, red-400 for errors. Text colors: gray-100 primary, gray-400 secondary, gray-500 muted.

#### Scenario: Page background
- **WHEN** any page renders
- **THEN** the body background SHALL be slate-950 and text SHALL be gray-100

#### Scenario: Card surface
- **WHEN** a Card component renders
- **THEN** it SHALL have a slate-800 background with slate-700 border and rounded-lg corners

### Requirement: Typography scale
The system SHALL use monospace font (system mono stack) for headings, session identifiers, code, and technical labels. System sans-serif font SHALL be used for body text, descriptions, and UI controls.

#### Scenario: Page heading
- **WHEN** a page heading (h1) renders
- **THEN** it SHALL use monospace font with font-bold

#### Scenario: Body text
- **WHEN** descriptive or UI text renders
- **THEN** it SHALL use the system sans-serif font

### Requirement: Badge component
The system SHALL provide a Badge component with variants: `active` (emerald bg), `ended` (gray bg), `archived` (red bg), `agent` (cyan bg), and `default` (slate bg). Each badge SHALL render as a small rounded-full pill with appropriate text color.

#### Scenario: Active status badge
- **WHEN** a Badge renders with variant "active"
- **THEN** it SHALL display with emerald background and white text

#### Scenario: Agent type badge
- **WHEN** a Badge renders with variant "agent"
- **THEN** it SHALL display with cyan background and slate-900 text

### Requirement: StatusDot component
The system SHALL provide a StatusDot component that renders a small colored circle. Active status SHALL display a pulsing emerald animation. Ended status SHALL display a static gray dot. Archived status SHALL display a static red dot.

#### Scenario: Active session dot
- **WHEN** a StatusDot renders with status "active"
- **THEN** it SHALL display a pulsing emerald circle with CSS animation

#### Scenario: Ended session dot
- **WHEN** a StatusDot renders with status "ended"
- **THEN** it SHALL display a static gray circle with no animation

### Requirement: WAPI to wappy rename
The system SHALL replace all user-facing "WAPI" references with "wappy" including the HTML page title, heading text, and any UI strings.

#### Scenario: Page title
- **WHEN** the HTML page loads
- **THEN** the document title SHALL be "wappy"

#### Scenario: Dashboard heading
- **WHEN** the main dashboard renders
- **THEN** it SHALL display "wappy" as the brand name, not "WAPI"
