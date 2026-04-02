## Context

The app runs TanStack Start on Cloudflare Workers with partyserver for WebSocket support. Server functions use `createServerFn` for RPC-style calls from loaders/components. API routes use `server: { handlers: { GET, POST } }` for REST endpoints. The server entry uses `createServerEntry` which wraps `fetch(request)` and does not expose the `ExecutionContext` (`ctx`).

DO notifications (`notifyUserRoom`/`notifySessionRoom`) call `env.UserRoom.get(id).fetch()` to send messages to DOs which broadcast to WebSocket clients. These must complete before the Worker exits. Without `ctx.waitUntil()`, we must `await` them (adding latency) and even that is unreliable — notifications drop after a few messages per session.

The app has 4 page routes, 11 API resource routes, 5 server functions, and ~15 components. All components are standard React — only the routing/server layer is framework-specific.

## Goals / Non-Goals

**Goals:**
- Access `ctx.waitUntil()` in all server-side code (loaders, actions, resource routes)
- Non-blocking DO notifications that reliably complete after the response is sent
- Preserve all existing functionality: session list, session detail with real-time messages, auth, API endpoints
- Preserve existing component library (MessageBubble, MessageThread, etc.) without changes
- Keep partyserver/PartySocket integration working

**Non-Goals:**
- Redesigning the DO notification architecture (just fixing the delivery mechanism)
- Changing the data model (D1, R2, KV stay the same)
- Changing the CLI or wire packages
- Adding new features during migration

## Decisions

### Decision 1: Use React Router v7 file-based routing with `@react-router/dev`

React Router v7 supports file-based routing via its Vite plugin. Routes live in `app/routes/` with conventions like `_index.tsx`, `sessions.$sessionId.tsx`, etc. This maps closely to our current TanStack file-based routes.

**Alternative considered**: Manual route config in `routes.ts`. Rejected — file-based routing is simpler and matches our current structure.

### Decision 2: Pass `ctx` through `AppLoadContext`

The server entry captures `(request, env, ctx)` and passes `{ cloudflare: { env, ctx } }` to `createRequestHandler`. Every loader/action receives this via their `context` parameter. The notify functions accept `ctx` and call `ctx.waitUntil(promise)`.

**Alternative considered**: Using the ambient `import { waitUntil } from "cloudflare:workers"`. Rejected — we already confirmed this doesn't work with framework-wrapped entry points.

### Decision 3: Convert server functions to loaders/actions

TanStack's `createServerFn` RPCs become:
- **Read operations** → React Router `loader` functions (GET semantics)
- **Write operations** → React Router `action` functions (POST semantics)
- **API resource routes** → `.ts` files (no default export/component) with `loader`/`action` exports

The auth check (`requireAuth()`) moves to a shared utility that reads from the `AppLoadContext` or request headers.

### Decision 4: Keep partyserver integration in server.ts

The `routePartykitRequest` call stays in `server.ts` before the React Router handler — same as today. WebSocket upgrade requests are intercepted before React Router sees them.

### Decision 5: Migrate API routes as resource routes

React Router v7 resource routes are `.ts` files in `app/routes/` that export `loader`/`action` but no component. Our REST API endpoints (`/api/messages`, `/api/sessions`, etc.) become resource routes. The URL structure stays the same via route file naming: `api.messages.ts` → `/api/messages`.

## Risks / Trade-offs

- **Migration scope** → ~20 files need changes. Mitigation: components stay unchanged, only routing/server layer moves. Can be done incrementally by route.
- **TanStack-specific features** → We use `Route.useLoaderData()`, `Route.useRouteContext()`, `createFileRoute`. These are framework-specific. Mitigation: React Router equivalents exist for all of them (`useLoaderData`, `useRouteLoaderData`, file-based routes).
- **Test migration** → Server-side tests that mock `createServerFn` or use TanStack test utilities need rewriting. Mitigation: Most tests are unit tests for pure functions (messages.ts, sessions.ts, notify.ts) which are framework-agnostic.
- **partyserver compatibility** → `routePartykitRequest` works with any `fetch(request)` handler. Should work unchanged with React Router. Risk is low.
- **Vite plugin swap** → `@cloudflare/vite-plugin` stays. Replace `tanstackStart()` with `reactRouter()` plugin. May need to verify SSR environment configuration.
