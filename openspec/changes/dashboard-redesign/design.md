## Context

The wappy dashboard is a TanStack Start app on Cloudflare Workers. It currently uses plain Tailwind CSS utilities with no design system, no markdown rendering, and minimal mobile optimization. The UI references the old "WAPI" name. Assistant messages display as raw monospace text in `<pre>` tags — no markdown, no code highlighting.

The app uses Tailwind CSS v4 (import-only via `@tailwindcss/vite`), React 19, and TanStack Router. There is no existing component library (no shadcn, Radix, etc.). Real-time updates come via PartySocket WebSockets.

## Goals / Non-Goals

**Goals:**
- Establish a dark terminal aesthetic with consistent design tokens
- Render assistant messages as rich markdown with syntax-highlighted code blocks
- Make the dashboard mobile-first and PWA-friendly
- Create reusable UI primitives for consistency
- Rename all "WAPI" references to "wappy"

**Non-Goals:**
- Adding new backend features or API endpoints
- Changing the data model or database schema
- Adding authentication changes
- Building a full component library (just the primitives we need)
- Dark/light theme toggle (dark only for now)

## Decisions

### Decision 1: Shiki for code syntax highlighting

Use `shiki` with the `vitesse-dark` theme for code blocks inside markdown. Shiki uses VS Code's TextMate grammar engine and produces beautiful output that matches the terminal aesthetic.

**Why**: Shiki produces the highest-quality highlighting and ships dark themes that match our palette. It can highlight on the server (SSR-friendly for TanStack Start).

**Alternative considered**: `react-syntax-highlighter` with Prism. Lighter bundle (~50KB vs ~200KB) but lower quality output and theme customization is more limited. For a developer tool dashboard, the visual quality matters.

**Implementation**: Use `shiki`'s `codeToHtml()` in a custom `CodeBlock` component. Pre-create highlighter instance to avoid repeated initialization. Render via `dangerouslySetInnerHTML` (safe since shiki generates the HTML from code strings, not user-authored HTML).

### Decision 2: react-markdown + remark-gfm for markdown rendering

Use `react-markdown` with `remark-gfm` plugin for GitHub-flavored markdown (tables, strikethrough, task lists). Custom component overrides for code blocks (route to shiki), links (open in new tab), and tables (styled with dark theme).

**Why**: `react-markdown` is the standard React markdown renderer. `remark-gfm` adds the GFM extensions that Claude's output commonly uses (tables, task lists).

**Alternative considered**: `@mdx-js/react` — overkill for rendering, designed for authoring. `markdown-it` — not React-native, would need wrapper.

### Decision 3: Tailwind v4 CSS theme for design tokens

Define the dark palette using Tailwind v4's `@theme` directive in `app.css`. This gives us CSS custom properties for the color palette, which can be referenced in both utility classes and custom CSS.

**Why**: Tailwind v4 natively supports `@theme` for design tokens. No extra config files needed — just CSS. Keeps everything in one place.

### Decision 4: Component extraction pattern

Create shared components in `app/src/components/ui/`:
- `Badge.tsx` — status/type badges with color variants
- `StatusDot.tsx` — pulsing/static status indicators
- `Card.tsx` — dark card container with hover states
- `MessageBubble.tsx` — role-based chat bubble (user/assistant/tool/system)
- `MarkdownContent.tsx` — markdown renderer wrapping react-markdown + shiki
- `NavShell.tsx` — top nav (desktop) + bottom tabs (mobile)
- `SearchInput.tsx` — styled search input

**Why**: Extracting these primitives prevents duplication across the 4 page routes and makes the design system tangible/reusable.

### Decision 5: Bottom tab navigation on mobile

On screens < `sm` (640px), replace the top nav with a fixed bottom tab bar containing 3 tabs: Sessions, Dashboard, Devices. On desktop, keep a horizontal top nav bar.

**Why**: Bottom tabs are the standard mobile PWA pattern — thumb-reachable, familiar, matches iOS/Android conventions. The app has only 3 main sections, which fits perfectly in a tab bar.

### Decision 6: Relative timestamps with `Intl.RelativeTimeFormat`

Display session times as "2h ago", "yesterday", "Mar 27" using the browser's built-in `Intl.RelativeTimeFormat`. No date library dependency needed.

**Why**: Avoids adding `date-fns` or `dayjs` for a single formatting need. The Intl API is supported in all modern browsers and handles localization automatically.

## Risks / Trade-offs

- **Shiki bundle size (~200KB)** → Acceptable for a developer tool dashboard. Can lazy-load the highlighter if initial load becomes an issue. SSR pre-rendering could eliminate client-side cost entirely.
- **Dark-only design** → No light mode toggle. Users who prefer light mode are out of luck. Mitigation: can add theme toggle later; the CSS custom properties approach makes this straightforward.
- **Undocumented Claude markdown patterns** → Claude's output may use markdown features we don't handle (e.g., LaTeX math, Mermaid diagrams). Mitigation: `react-markdown` gracefully degrades — unhandled syntax renders as text.
- **SSR hydration with shiki** → Shiki is async (loading WASM grammars). Need to handle the loading state during hydration. Mitigation: render code blocks as plain `<pre>` during SSR/loading, enhance with highlighting on client.
