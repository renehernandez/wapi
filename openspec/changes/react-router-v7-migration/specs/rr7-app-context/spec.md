## ADDED Requirements

### Requirement: AppLoadContext with Cloudflare bindings
The system SHALL define an `AppLoadContext` type that provides `cloudflare.env` (typed `Env` with D1, KV, R2, DO bindings) and `cloudflare.ctx` (`ExecutionContext` with `waitUntil`). Every loader, action, and resource route SHALL receive this context.

#### Scenario: Loader accesses D1 via context
- **WHEN** a route loader executes
- **THEN** it SHALL access D1 via `context.cloudflare.env.DB`

#### Scenario: Action uses waitUntil for background work
- **WHEN** a route action needs to run a background task after returning the response
- **THEN** it SHALL call `context.cloudflare.ctx.waitUntil(promise)` and the Worker SHALL stay alive until the promise resolves

#### Scenario: Resource route accesses env and ctx
- **WHEN** a REST API resource route handles a request
- **THEN** its loader/action SHALL receive `AppLoadContext` with both `env` and `ctx`
