## 1. Agent Adapter Interface + Registry

- [x] 1.1 Create `packages/cli/src/adapters/types.ts` — AgentAdapter interface, AgentMessage discriminated union, SpawnOptions type
- [x] 1.2 Create `packages/cli/src/adapters/registry.ts` — adapter registry mapping tool names to implementations, lookup function, list available
- [x] 1.3 Write tests for registry — lookup by name, unknown tool returns null, list available

## 2. Claude Code Adapter

- [x] 2.1 Create `packages/cli/src/adapters/claude.ts` — spawn with `--output-format stream-json`, parse JSON lines
- [x] 2.2 Implement parseMessage for Claude output types: assistant text, tool_use, tool_result, error
- [x] 2.3 Implement isAvailable — check `claude --version`
- [x] 2.4 Register Claude adapter in registry
- [x] 2.5 Write tests for Claude message parsing (mock JSON lines)

## 3. Codex Adapter

- [x] 3.1 Create `packages/cli/src/adapters/codex.ts` — spawn with `--full-stdout`, parse output
- [x] 3.2 Implement parseMessage for Codex output format
- [x] 3.3 Implement isAvailable — check `codex --version`
- [x] 3.4 Register Codex adapter in registry
- [x] 3.5 Write tests for Codex message parsing

## 4. Session Sync Pipeline

- [x] 4.1 Create `packages/cli/src/sync/session-sync.ts` — SessionSync class with start, addMessage, end methods
- [x] 4.2 Implement lazy session creation — create on first message via API client
- [x] 4.3 Implement message mapping — AgentMessage → server message format (role + content)
- [x] 4.4 Implement session end — update session status to "ended" on process exit
- [x] 4.5 Implement error tolerance — catch and log API failures, never interrupt the tool
- [x] 4.6 Write tests for session sync — lazy creation, message mapping, error tolerance

## 5. API Client Extensions

- [x] 5.1 Add `createSession` method to CLI API client
- [x] 5.2 Add `addMessage` method to CLI API client
- [x] 5.3 Add `updateSession` method to CLI API client

## 6. Updated wapi run Command

- [x] 6.1 Rewrite `packages/cli/src/commands/wrap.ts` — use adapter registry, spawn via adapter, pipe stdout through line reader
- [x] 6.2 Implement JSON line reader — read child process stdout line by line, parse each via adapter
- [x] 6.3 Wire up SessionSync — create sync instance, feed AgentMessages, end on process exit
- [x] 6.4 Pass through extra CLI arguments to the adapter's spawn
- [x] 6.5 Handle unknown tool name — display error with available adapters list
- [x] 6.6 Handle tool not installed — display error with install instructions

## 7. Integration Testing

- [x] 7.1 Write test for full pipeline: mock adapter → SessionSync → mock API client → verify API calls
- [x] 7.2 Write test for error tolerance: API client throws → tool continues running
