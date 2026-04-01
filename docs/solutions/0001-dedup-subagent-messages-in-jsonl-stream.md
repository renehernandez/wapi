---
title: Deduplicating subagent messages in Claude JSONL streams
tags: [jsonl, subagent, dedup, session-capture]
date: 2026-04-01
---

# Deduplicating Subagent Messages in JSONL Streams

## Problem

When parsing Claude Code's JSONL session files, subagent (tool delegation) output appears **twice**:

1. As `progress` events streamed in real-time during subagent execution
2. As `user` type entries with `toolUseResult.status === "completed"` after the subagent finishes

If both are captured, the session replay shows duplicate messages for every subagent interaction.

## Insight

The `toolUseResult` entries are Claude's internal bookkeeping — the same content is relayed in the next `assistant` message. The `progress` events are the canonical source for subagent activity because they arrive in real-time and contain structured data (tool names, inputs, outputs).

The fix is a single filter at the top-level JSONL parser (`parseClaudeJsonl`):

```typescript
// Skip subagent results — Claude relays the content in the next assistant message
if (data.toolUseResult?.status === "completed") {
  return null;
}
```

This must happen **before** extracting text content from the `user` message, otherwise the toolUseResult's text gets emitted as a regular user message.

## Pattern

When consuming event streams that have both incremental (progress) and summary (result) entries for the same operation, filter out the summary entries early in the pipeline. Prefer the incremental events as the canonical source — they have richer structure and arrive in real-time.

## Files

- `packages/cli/src/sync/jsonl-tailer.ts` — `parseClaudeJsonl()` line 117 (dedup filter), `parseProgressEvent()` (progress parsing)
