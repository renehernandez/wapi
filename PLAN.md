# happy-edge

PWA AI session sync on Cloudflare Workers — inspired by [slopus/happy](https://github.com/slopus/happy) and [tiann/hapi](https://github.com/tiann/hapi), built for the Workers platform from the ground up.

## What it is

Encrypted sync of AI coding sessions (Claude Code, Codex, etc.) across devices. Access your sessions from any browser. No native app required.

## Stack

| Layer | Technology |
|---|---|
| Full-stack framework | TanStack Start (React, SSR, server functions) |
| Runtime | Cloudflare Workers (single Worker serves everything) |
| Database | D1 (SQLite) via Drizzle ORM |
| Real-time | Durable Objects + `partyserver` |
| Client WebSocket | `partysocket` (reconnecting WS with buffering) |
| File storage | R2 |
| Cache/tokens | KV |
| Background jobs | Cron Triggers |
| Crypto | `tweetnacl` (Ed25519/Curve25519) |
| Validation | Zod |
| Styling | TailwindCSS |
| Package manager | pnpm workspaces |

## Project Structure

```
happy-edge/
├── app/                           # TanStack Start full-stack app
│   ├── src/
│   │   ├── server.ts              # Worker entry: TanStack Start + routePartykitRequest
│   │   ├── router.tsx
│   │   ├── routes/
│   │   │   ├── __root.tsx         # Root layout (nav, auth context, WS connection)
│   │   │   ├── index.tsx          # Dashboard
│   │   │   ├── sessions/
│   │   │   │   ├── index.tsx      # Session list
│   │   │   │   └── $sessionId.tsx # Session detail + live terminal view
│   │   │   ├── machines.tsx
│   │   │   ├── settings.tsx
│   │   │   └── login.tsx
│   │   ├── server/
│   │   │   ├── functions/
│   │   │   │   ├── auth.ts        # Ed25519 challenge-response
│   │   │   │   ├── sessions.ts    # CRUD sessions + messages
│   │   │   │   ├── machines.ts    # Machine registration + state
│   │   │   │   ├── artifacts.ts   # Encrypted blob CRUD
│   │   │   │   ├── kv.ts          # Per-user KV store
│   │   │   │   ├── account.ts     # Profile + settings
│   │   │   │   └── push.ts        # Web Push management
│   │   │   ├── auth/
│   │   │   │   ├── verify.ts      # tweetnacl Ed25519 verification
│   │   │   │   └── token.ts       # KV-backed token generation/validation
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts        # Auth middleware for server functions
│   │   │   └── lib/
│   │   │       ├── db.ts          # Drizzle D1 client
│   │   │       ├── encrypt.ts     # Server-side encryption helpers
│   │   │       └── seq.ts         # Monotonic sequence allocation
│   │   ├── parties/
│   │   │   ├── user.ts            # Per-user DO: broadcasts updates
│   │   │   └── session.ts         # Per-session DO: live terminal view
│   │   ├── client/
│   │   │   ├── sync/
│   │   │   │   ├── socket.ts      # partysocket connection manager
│   │   │   │   ├── sync.ts        # State sync engine
│   │   │   │   └── encryption.ts  # Client-side E2E crypto
│   │   │   └── auth/
│   │   │       ├── keypair.ts     # Ed25519 keypair generation + storage
│   │   │       └── context.tsx    # React auth context
│   │   └── components/
│   │       ├── SessionList.tsx
│   │       ├── Terminal.tsx
│   │       └── DevicePairing.tsx
│   ├── db/
│   │   ├── schema.ts              # Drizzle D1 schema
│   │   └── migrations/
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   └── sw.js                  # Service worker
│   ├── wrangler.jsonc
│   ├── app.config.ts
│   └── package.json
├── packages/
│   └── wire/                      # Shared Zod schemas (app + future CLI)
│       └── src/
│           ├── messages.ts
│           ├── updates.ts
│           └── crypto.ts
├── package.json
└── pnpm-workspace.yaml
```

## Key Architecture: `src/server.ts`

```ts
import handler from "@tanstack/react-start/server-entry";
import { routePartykitRequest } from "partyserver";

export { UserRoom } from "./parties/user";
export { SessionRoom } from "./parties/session";

export default {
  async fetch(request, env, ctx) {
    // WebSocket upgrades → Durable Objects
    const partyResponse = await routePartykitRequest(request, env);
    if (partyResponse) return partyResponse;
    // Everything else → TanStack Start (SSR + server functions)
    return handler.fetch(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    // Cron: presence timeout, cache cleanup
  },
};
```

## Database Schema (D1/SQLite via Drizzle)

~10 tables, simplified from happy's 17:

- **`accounts`** — public key, profile, settings, seq counter
- **`sessions`** — encrypted metadata + agent state, per-session encryption key
- **`session_messages`** — encrypted content, ordered by seq
- **`machines`** — encrypted metadata + daemon state
- **`artifacts`** — encrypted header + body blobs
- **`user_kv`** — encrypted per-user key-value store (null value = tombstone)
- **`auth_requests`** — terminal/account pairing handshake records
- **`push_subscriptions`** — Web Push endpoints
- **`cache`** — idempotency keys + general cache with expiry

SQLite adaptations: `BLOB` for bytes, `INTEGER` for bigints, `TEXT` for datetimes, `CHECK` instead of enums, optimistic concurrency instead of serializable transactions.

## Implementation Phases

### Phase 1 — Foundation ✅ TODO
- Scaffold TanStack Start with Cloudflare preset
- Custom `server.ts` with `routePartykitRequest`
- Drizzle schema + D1 migration (accounts, auth_requests, cache)
- `POST /auth` server function — Ed25519 verify + account upsert + KV token
- Auth middleware
- Login route with in-browser keypair generation

### Phase 2 — Sessions + Machines CRUD
- Server functions: sessions, messages, machines
- D1 migrations
- Monotonic `seq` allocator
- Optimistic concurrency on versioned fields
- Routes: session list, session detail, machine list

### Phase 3 — Real-time (Durable Objects)
- `UserRoom extends Server` — per-user DO, hibernation, broadcasts updates
- `SessionRoom extends Server` — live session viewing
- Server functions notify DOs after mutations via `getServerByName()`
- Client: `partysocket` in root layout → React state updates

### Phase 4 — PWA + Device Pairing
- PWA manifest + service worker
- Device pairing flow (terminal publishes Curve25519 key → web app approves)
- IndexedDB for offline session cache
- Web Push subscription management

### Phase 5 — Artifacts, KV, Files (R2)
- Artifact CRUD, KV get/list/bulk/mutate
- R2 file upload/download

### Phase 6 — Background Jobs + Polish
- Cron: presence timeout, cache cleanup
- Push notifications via Queues
- Lighthouse PWA audit

## Key Patterns

### From happy
- Ed25519 challenge-response auth (`tweetnacl.sign.detached.verify`)
- Encrypted payload envelope: `{t: 'encrypted', c: '<ciphertext>'}`
- Monotonic `seq` counter per user for update ordering
- Optimistic concurrency via `expectedVersion`
- Device pairing flow (CLI publishes key → authenticated device approves)

### From hapi
- Compact SQLite schema, direct SQL when needed
- Single-deployment mindset

### From partykit fixtures
- Hibernation: `static options = { hibernate: true }`
- `onBeforeConnect` for WebSocket auth
- wrangler.jsonc DO binding + `new_sqlite_classes` migration pattern

## Risks

| Risk | Mitigation |
|---|---|
| D1 no serializable transactions | Optimistic concurrency + single-row atomic updates |
| Drizzle D1 maturity | Production-ready; fallback to raw `env.DB.prepare()` |
| DO cold start | Hibernation enabled — ~50ms first-connection overhead |
| tweetnacl in Workers | Pure JS, no native deps |
| R2 100MB body limit | Presigned URLs for large files |
| PWA vs native | Web Push + IndexedDB service worker cache |

## Verification

1. **Unit**: Vitest — server functions, auth logic, schema
2. **Integration**: Miniflare — D1/DO/R2/KV
3. **E2E**: Playwright — login, create session, real-time update across tabs
4. **PWA**: Lighthouse audit, offline behavior, install prompt
5. **Load**: Concurrent WebSocket connections to a UserRoom DO
