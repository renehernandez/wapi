## ADDED Requirements

### Requirement: Role-based chat bubble layout
The system SHALL render session messages as chat bubbles with role-based alignment and colors:
- **User**: Right-aligned, cyan-900/800 background, rounded-lg with rounded-br-sm
- **Assistant**: Left-aligned, slate-800 background, rounded-lg with rounded-bl-sm
- **Tool**: Left-aligned, collapsible card with wrench icon and tool name header
- **System**: Centered, small gray-500 italic text

#### Scenario: User message bubble
- **WHEN** a message with role "user" renders
- **THEN** it SHALL be right-aligned with cyan-tinted background

#### Scenario: Assistant message bubble
- **WHEN** a message with role "assistant" renders
- **THEN** it SHALL be left-aligned with slate-800 background and markdown-rendered content

#### Scenario: System message
- **WHEN** a message with role "system" renders
- **THEN** it SHALL be centered with small gray-500 italic text

### Requirement: Collapsible tool call display
Tool messages SHALL render as a collapsible card. The collapsed state SHALL show only the tool name with a wrench icon. Expanding SHALL reveal the JSON content in a formatted code block.

#### Scenario: Tool call collapsed
- **WHEN** a tool message renders
- **THEN** it SHALL display collapsed with only the tool name and a wrench icon visible

#### Scenario: Tool call expanded
- **WHEN** the user clicks on a collapsed tool call
- **THEN** it SHALL expand to show the JSON content in a formatted code block

### Requirement: Message sequence indicators
Message sequence numbers SHALL render as subtle gray-600 text above each bubble, not inside the bubble.

#### Scenario: Sequence number display
- **WHEN** a message renders
- **THEN** its sequence number (e.g., "#3") SHALL appear above the bubble in gray-600 text

### Requirement: Live session indicator
When viewing an active session, the header SHALL display a pulsing emerald dot and "Live" text. This indicator SHALL use the StatusDot component with active status.

#### Scenario: Active session header
- **WHEN** the session detail page renders for a session with status "active"
- **THEN** the header SHALL display a pulsing emerald StatusDot and "Live" label

#### Scenario: Ended session header
- **WHEN** the session detail page renders for a session with status "ended"
- **THEN** no Live indicator SHALL be displayed

### Requirement: Auto-scroll with new message pill
The message thread SHALL auto-scroll to the bottom when new messages arrive, but only if the user is already at the bottom. If the user has scrolled up, a "New messages" pill SHALL appear at the bottom that scrolls to the latest message when clicked.

#### Scenario: User at bottom receives new message
- **WHEN** a new message arrives and the user is scrolled to the bottom
- **THEN** the thread SHALL auto-scroll to show the new message

#### Scenario: User scrolled up receives new message
- **WHEN** a new message arrives and the user has scrolled up
- **THEN** a "New messages" pill SHALL appear at the bottom of the viewport

#### Scenario: User clicks new messages pill
- **WHEN** the user clicks the "New messages" pill
- **THEN** the thread SHALL scroll to the bottom and the pill SHALL disappear

### Requirement: Session detail header redesign
The session detail header SHALL display: session title (mono, or "Untitled session" in gray-500), agent type badge, status dot, message count, and a back button (left arrow icon linking to /sessions). On mobile, this header SHALL be compact and sticky.

#### Scenario: Session detail header
- **WHEN** the session detail page renders
- **THEN** it SHALL display title, agent badge, status dot, message count, and back button

#### Scenario: Mobile sticky header
- **WHEN** the session detail page renders on mobile
- **THEN** the header SHALL be sticky at the top so it remains visible while scrolling messages
