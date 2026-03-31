## Why

The wappy dashboard is functionally working but visually bare — plain Tailwind utilities, no design system, no markdown rendering for AI messages, and a poor mobile experience. As a PWA for syncing AI coding sessions across devices, the dashboard needs to look polished on phones and render assistant responses (which are markdown-heavy with code blocks, tables, and lists) properly. The page title and some UI strings still reference "WAPI" after the rename to wappy.

## What Changes

- Establish a dark terminal aesthetic design system: slate-900/800 palette, emerald/cyan accents, monospace headings, system sans body text
- Add a persistent nav bar (top on desktop, bottom tabs on mobile) with wappy branding
- Redesign sessions list: search input, card-based layout with status dots, relative timestamps, agent badges, message counts
- Redesign session detail: chat-bubble message layout with role-based styling (user right-aligned cyan, assistant left-aligned slate), collapsible tool call cards, live session indicator with pulse animation
- Add markdown rendering for assistant messages using `react-markdown` + `remark-gfm` with `shiki` syntax highlighting for code blocks
- Redesign main dashboard: recent sessions widget, device cards grid, session stats counters
- Mobile-first responsive design: bottom tab navigation, full-width cards, touch-optimized tap targets
- Create shared UI components: Badge, StatusDot, Card, MessageBubble, MarkdownContent
- Rename all remaining "WAPI" references to "wappy" in UI strings, page titles, and metadata
- Add new dependencies: `react-markdown`, `remark-gfm`, `shiki`

## Capabilities

### New Capabilities

- `design-system`: Dark terminal aesthetic tokens — color palette, typography (mono + sans), spacing, shared UI primitives (Badge, StatusDot, Card)
- `markdown-content`: Markdown rendering component for AI messages — react-markdown + remark-gfm + shiki code highlighting, dark theme
- `nav-shell`: Persistent navigation shell — top nav bar on desktop, bottom tab bar on mobile, wappy branding, route links
- `session-cards`: Card-based session list with search, status filters, relative timestamps, agent badges, status indicators
- `message-bubbles`: Chat-bubble message layout with role-based alignment/colors, collapsible tool calls, live indicator, auto-scroll with "new messages" pill

### Modified Capabilities

_None — this change is purely frontend/UI. No backend behavior or API changes._

## Impact

- **App routes**: `app/src/routes/__root.tsx`, `app/src/routes/index.tsx`, `app/src/routes/sessions/index.tsx`, `app/src/routes/sessions/$sessionId.tsx`, `app/src/routes/auth/device.tsx`
- **Components**: All files in `app/src/components/` — SessionList, MessageThread, DeviceList, DeviceApproval will be rewritten or heavily modified
- **New components**: `app/src/components/ui/` — Badge, StatusDot, Card, MessageBubble, MarkdownContent, NavShell, SearchInput
- **Styles**: `app/src/styles/app.css` — Tailwind v4 theme customization for dark palette
- **Dependencies**: Add `react-markdown`, `remark-gfm`, `shiki` to `app/package.json`
- **No backend changes**: Server functions, API routes, database schema, and wire package are unaffected
