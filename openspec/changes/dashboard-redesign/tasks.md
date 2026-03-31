## 1. Foundation & Dependencies

- [x] 1.1 Add `react-markdown`, `remark-gfm`, and `shiki` to `app/package.json` and install
- [x] 1.2 Update `app/src/styles/app.css` with Tailwind v4 `@theme` directive: dark palette custom properties (slate-950 bg, emerald/cyan accents), mono + sans font stacks
- [x] 1.3 Update `app/src/routes/__root.tsx`: change page title from "WAPI" to "wappy", set body bg to slate-950 and text to gray-100

## 2. Shared UI Components

- [x] 2.1 Create `app/src/components/ui/Badge.tsx`: variants for active (emerald), ended (gray), archived (red), agent (cyan), default (slate)
- [x] 2.2 Create `app/src/components/ui/StatusDot.tsx`: pulsing emerald for active, static gray for ended, static red for archived (CSS keyframe animation)
- [x] 2.3 Create `app/src/components/ui/Card.tsx`: slate-800 bg, slate-700 border, rounded-lg, hover border transition
- [x] 2.4 Create `app/src/components/ui/SearchInput.tsx`: slate-800 bg, slate-700 border, placeholder styling, search icon
- [x] 2.5 Create `app/src/components/ui/MarkdownContent.tsx`: react-markdown + remark-gfm, custom component overrides for code (shiki), links (new tab), tables (dark styled), inline code (slate-700 pill)
- [x] 2.6 Create shiki highlighter setup: lazy-init singleton with vitesse-dark theme, CodeBlock component with loading fallback to plain `<pre>`

## 3. Navigation Shell

- [x] 3.1 Create `app/src/components/ui/NavShell.tsx`: desktop top nav bar (slate-950, fixed, wappy wordmark, Sessions/Devices links, user email)
- [x] 3.2 Add mobile bottom tab bar to NavShell: 3 tabs (Sessions, Dashboard, Devices) with icons, hidden on sm+, active tab cyan highlighting
- [x] 3.3 Integrate NavShell into `__root.tsx` layout, add content padding for fixed nav (top on desktop, bottom on mobile)

## 4. Session List Page Redesign

- [x] 4.1 Add search input to `app/src/routes/sessions/index.tsx` with client-side title filtering
- [x] 4.2 Restyle status filter buttons as segmented control with dark theme
- [x] 4.3 Rewrite `app/src/components/SessionList.tsx` to use Card components with: mono title, agent Badge, relative timestamp, StatusDot, message count
- [x] 4.4 Add relative timestamp utility function using `Intl.RelativeTimeFormat`
- [x] 4.5 Add terminal-style empty state: `> No sessions found. Run "wappy run claude" to start one.`
- [x] 4.6 Ensure mobile cards are full-width with 48px minimum touch targets

## 5. Session Detail Page Redesign

- [x] 5.1 Redesign session detail header: mono title, agent Badge, StatusDot, message count, back arrow button, sticky on mobile
- [x] 5.2 Add live session indicator: pulsing StatusDot + "Live" label when session status is active
- [x] 5.3 Rewrite `app/src/components/MessageThread.tsx` using MessageBubble components: user (right, cyan), assistant (left, slate, markdown), system (centered, gray italic)
- [x] 5.4 Create `app/src/components/ui/MessageBubble.tsx`: role-based alignment, colors, rounded corners
- [x] 5.5 Add collapsible tool call cards: wrench icon, tool name header, expandable JSON content
- [x] 5.6 Render assistant message content through MarkdownContent component
- [x] 5.7 Add sequence numbers above bubbles in gray-600
- [x] 5.8 Implement auto-scroll with "New messages" pill when user has scrolled up

## 6. Dashboard Page Redesign

- [x] 6.1 Redesign `app/src/routes/index.tsx` header: "wappy" in mono with terminal cursor blink animation, user email, device count
- [x] 6.2 Restyle recent sessions widget using compact session cards with "View all" link
- [x] 6.3 Restyle `app/src/components/DeviceList.tsx`: dark card grid, device name in mono, relative last-seen time, status dot, ghost revoke button
- [x] 6.4 Add stats row: total sessions, active sessions, total messages (mono numbers, gray-400 labels)

## 7. Device Auth Page

- [x] 7.1 Restyle `app/src/routes/auth/device.tsx` and `app/src/components/DeviceApproval.tsx` with dark theme: slate-800 modal card, mono code display, dark-styled buttons

## 8. Cleanup & Validation

- [x] 8.1 Sweep all remaining "WAPI" string references across app routes and components, replace with "wappy"
- [x] 8.2 Run `pnpm typecheck` and fix any TypeScript errors
- [x] 8.3 Run `pnpm build:app` and verify build succeeds
- [ ] 8.4 Visual test: navigate sessions list, session detail, dashboard, and device auth on desktop viewport — **requires manual verification**
- [ ] 8.5 Visual test: verify mobile layout (bottom tabs, card sizing, touch targets) on narrow viewport — **requires manual verification**
