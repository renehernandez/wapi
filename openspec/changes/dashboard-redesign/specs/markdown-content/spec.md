## ADDED Requirements

### Requirement: Markdown rendering for assistant messages
The system SHALL render assistant message content as GitHub-flavored markdown using `react-markdown` with `remark-gfm`. This includes headings, bold, italic, lists, tables, task lists, links, inline code, and fenced code blocks.

#### Scenario: Assistant message with markdown
- **WHEN** an assistant message contains markdown (e.g., headings, lists, bold)
- **THEN** the system SHALL render it as formatted HTML, not plain text

#### Scenario: User message rendering
- **WHEN** a user message renders
- **THEN** it SHALL render as plain text (no markdown processing)

#### Scenario: Table rendering
- **WHEN** an assistant message contains a GFM table
- **THEN** it SHALL render as a styled HTML table with dark-themed borders and cell padding

### Requirement: Syntax-highlighted code blocks
The system SHALL use `shiki` with the `vitesse-dark` theme to syntax-highlight fenced code blocks in assistant messages. Code blocks SHALL specify their language via the info string (e.g., ` ```typescript `).

#### Scenario: Code block with language
- **WHEN** an assistant message contains a fenced code block with a language identifier
- **THEN** it SHALL render with shiki syntax highlighting in the vitesse-dark theme

#### Scenario: Code block without language
- **WHEN** an assistant message contains a fenced code block with no language
- **THEN** it SHALL render as a styled monospace block without syntax highlighting

#### Scenario: Inline code
- **WHEN** an assistant message contains inline code (backtick-wrapped)
- **THEN** it SHALL render with a slate-700 background pill and monospace font

### Requirement: Shiki loading state
The system SHALL handle the async initialization of shiki gracefully. While shiki is loading, code blocks SHALL render as plain `<pre>` elements with monospace styling. Once loaded, code blocks SHALL re-render with full syntax highlighting.

#### Scenario: Code block before shiki loads
- **WHEN** a code block renders before the shiki highlighter is initialized
- **THEN** it SHALL display as a plain monospace `<pre>` block with slate-800 background

#### Scenario: Code block after shiki loads
- **WHEN** the shiki highlighter finishes initializing
- **THEN** all code blocks SHALL re-render with syntax highlighting

### Requirement: Link handling in markdown
The system SHALL render links in assistant messages with cyan color and open external links in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).

#### Scenario: External link in assistant message
- **WHEN** an assistant message contains a markdown link
- **THEN** it SHALL render as a cyan-colored anchor that opens in a new tab
