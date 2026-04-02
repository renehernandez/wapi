## Why

TanStack Start does not propagate the Cloudflare Workers `ExecutionContext` (`ctx`) to server functions or route handlers, making `ctx.waitUntil()` unavailable. This breaks non-blocking DO notifications — the Worker exits before `stub.fetch()` completes, dropping real-time WebSocket messages. React Router v7 explicitly passes `ctx` through `AppLoadContext`, giving loaders, actions, and resource routes full access to `ctx.waitUntil()`.

## What Changes

- **BREAKING**: Replace TanStack Start (`@tanstack/react-start`, `@tanstack/react-router`) with React Router v7 (`react-router`, `@react-router/cloudflare`)
- Replace `createServerFn` server functions with React Router loaders and actions that receive `AppLoadContext` with `ctx.waitUntil()`
- Convert TanStack file-based routes to React Router v7 file-based routes
- Convert API resource routes from TanStack's `server: { handlers: {} }` pattern to React Router resource routes (`.ts` files exporting `loader`/`action`)
- Replace `createServerEntry` with React Router's `createRequestHandler` in `server.ts`, passing `{ cloudflare: { env, ctx } }`
- Update `notifyUserRoom`/`notifySessionRoom` to accept `ctx` and use `ctx.waitUntil()` for non-blocking delivery
- Remove Vite plugin swap: `@cloudflare/vite-plugin` stays, `tanstackStart()` plugin replaced with React Router's Vite plugin

## Capabilities

### New Capabilities

- `rr7-app-context`: AppLoadContext type providing `cloudflare.env` and `cloudflare.ctx` to all loaders/actions/resource routes
- `rr7-route-layout`: Root layout with auth, WebSocket listeners, and outlet — React Router v7 equivalent of `__root.tsx`

### Modified Capabilities

- `worker-entry`: Server entry changes from `createServerEntry`/`handler.fetch` to `createRequestHandler` with `AppLoadContext` passing `ctx`
- `do-notifications`: Notify functions accept `ctx` parameter and use `ctx.waitUntil()` instead of `await`
- `session-routes`: Session list and detail pages migrate from TanStack `createFileRoute` + `useLoaderData` to React Router loaders
- `session-crud`: Server functions (`createServerFn`) become loader/action handlers
- `message-crud`: Server functions become loader/action handlers
- `session-room-do`: No spec change — DO class stays the same, only the notification caller changes
- `user-room-do`: No spec change — same as above

## Impact

- **app/ package**: All route files, server functions, server entry, Vite config, and package dependencies change
- **packages/cli/**: No changes — CLI communicates via REST API which stays the same
- **packages/wire/**: No changes — Zod schemas are framework-agnostic
- **Dependencies**: Remove `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-start/plugin/vite`. Add `react-router`, `@react-router/cloudflare`, `@react-router/dev`
- **Tests**: Server-side tests that import from `@tanstack/react-start` or use `createServerFn` need updates. Component tests using `Route.useLoaderData()` need migration.
- **Deploy**: No infrastructure changes — same D1, R2, KV, DOs. Wrangler config may need `main` path update.
