## MODIFIED Requirements

### Requirement: Custom Worker entry point
The system SHALL use a custom `src/server.ts` as the Worker entry point. The entry point SHALL route WebSocket upgrade requests to Durable Objects via `routePartykitRequest`, then fall back to React Router's `createRequestHandler` for all other requests. The `createRequestHandler` SHALL receive `AppLoadContext` with `{ cloudflare: { env, ctx } }` so loaders and actions can access the ExecutionContext.

#### Scenario: WebSocket upgrade request
- **WHEN** a request with `Upgrade: websocket` header arrives
- **THEN** `routePartykitRequest` SHALL route it to the appropriate DO (UserRoom or SessionRoom)

#### Scenario: Regular HTTP request
- **WHEN** a non-WebSocket request arrives
- **THEN** `routePartykitRequest` SHALL return null and the request SHALL be handled by React Router's `createRequestHandler` with `AppLoadContext`

#### Scenario: Loader accesses ExecutionContext
- **WHEN** a React Router loader executes during a request
- **THEN** it SHALL have access to `context.cloudflare.ctx.waitUntil()` via the AppLoadContext

### Requirement: DO class exports
The `server.ts` SHALL export the UserRoom and SessionRoom Durable Object classes so the Workers runtime can instantiate them.

#### Scenario: DO classes available
- **WHEN** the Worker starts
- **THEN** `UserRoom` and `SessionRoom` classes SHALL be available as named exports
