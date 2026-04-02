import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionSync } from "../sync/session-sync";

function createMockApi() {
  return {
    createDeviceCode: vi.fn(),
    pollDeviceCode: vi.fn(),
    listDevices: vi.fn(),
    revokeDevice: vi.fn(),
    createSession: vi.fn().mockResolvedValue({ id: "s-mock-123", version: 1 }),
    addMessage: vi.fn().mockResolvedValue(undefined),
    addMessages: vi.fn().mockResolvedValue(undefined),
    updateSession: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn(),
  };
}

describe("SessionSync", () => {
  let api: ReturnType<typeof createMockApi>;
  let sync: SessionSync;

  beforeEach(() => {
    vi.useFakeTimers();
    api = createMockApi();
    sync = new SessionSync(api as any, "claude");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates session lazily on first message", async () => {
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "Hello",
    });

    expect(api.createSession).toHaveBeenCalledOnce();
    expect(api.createSession).toHaveBeenCalledWith({
      agentType: "claude",
      machineId: undefined,
    });

    // Message is buffered, not sent yet
    expect(api.addMessage).not.toHaveBeenCalled();

    // Flush via timer
    await vi.advanceTimersByTimeAsync(200);

    // Single message uses addMessage (not batch)
    expect(api.addMessage).toHaveBeenCalledWith("s-mock-123", {
      role: "assistant",
      content: "Hello",
    });
  });

  it("batches multiple messages into a single addMessages call", async () => {
    await sync.handleMessage({
      type: "text",
      role: "user",
      content: "A",
    });
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "B",
    });
    await sync.handleMessage({
      type: "text",
      role: "user",
      content: "C",
    });

    expect(api.createSession).toHaveBeenCalledOnce();
    expect(api.addMessage).not.toHaveBeenCalled();
    expect(api.addMessages).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);

    expect(api.addMessages).toHaveBeenCalledWith("s-mock-123", [
      { role: "user", content: "A" },
      { role: "assistant", content: "B" },
      { role: "user", content: "C" },
    ]);
    expect(api.addMessage).not.toHaveBeenCalled();
  });

  it("does not create session twice", async () => {
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "A",
    });
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "B",
    });

    expect(api.createSession).toHaveBeenCalledOnce();
  });

  it("maps tool_call to role=tool with JSON content", async () => {
    await sync.handleMessage({
      type: "tool_call",
      name: "read_file",
      input: { path: "/foo" },
    });

    await vi.advanceTimersByTimeAsync(200);

    const addCall = api.addMessage.mock.calls[0];
    expect(addCall[1].role).toBe("tool");
    const parsed = JSON.parse(addCall[1].content);
    expect(parsed.type).toBe("tool_call");
    expect(parsed.name).toBe("read_file");
  });

  it("maps error to role=system", async () => {
    await sync.handleMessage({ type: "error", message: "Bad request" });

    await vi.advanceTimersByTimeAsync(200);

    const addCall = api.addMessage.mock.calls[0];
    expect(addCall[1].role).toBe("system");
    expect(addCall[1].content).toContain("Bad request");
  });

  it("skips turn_complete (no server call)", async () => {
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "A",
    });
    await sync.handleMessage({ type: "turn_complete" });

    await vi.advanceTimersByTimeAsync(200);

    expect(api.addMessage).toHaveBeenCalledOnce();
  });

  it("flushes buffer and ends session on end()", async () => {
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "A",
    });
    await sync.end();

    // Flush happened during end()
    expect(api.addMessage).toHaveBeenCalledWith("s-mock-123", {
      role: "assistant",
      content: "A",
    });
    expect(api.updateSession).toHaveBeenCalledWith("s-mock-123", {
      status: "ended",
      expectedVersion: 1,
    });
  });

  it("handles createSession failure gracefully", async () => {
    api.createSession.mockRejectedValue(new Error("network error"));

    await expect(
      sync.handleMessage({
        type: "text",
        role: "assistant",
        content: "A",
      }),
    ).resolves.not.toThrow();

    await vi.advanceTimersByTimeAsync(200);

    expect(api.addMessage).not.toHaveBeenCalled();
  });

  it("handles addMessage failure gracefully", async () => {
    api.addMessage.mockRejectedValue(new Error("server error"));

    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "A",
    });

    // Should not throw during flush
    await vi.advanceTimersByTimeAsync(200);
  });

  it("handles end failure gracefully", async () => {
    await sync.handleMessage({
      type: "text",
      role: "assistant",
      content: "A",
    });
    api.updateSession.mockRejectedValue(new Error("fail"));

    await expect(sync.end()).resolves.not.toThrow();
  });

  it("forwards metadata from tool_call message", async () => {
    await sync.handleMessage({
      type: "tool_call",
      name: "Bash",
      input: { command: "git status" },
      metadata: { isSubagent: true },
    });

    await vi.advanceTimersByTimeAsync(200);

    const addCall = api.addMessage.mock.calls[0];
    expect(addCall[1].role).toBe("tool");
    expect(addCall[1].metadata).toBe(JSON.stringify({ isSubagent: true }));
  });

  it("forwards metadata from tool_result message", async () => {
    await sync.handleMessage({
      type: "tool_result",
      output: "some output",
      metadata: { isSubagent: true },
    });

    await vi.advanceTimersByTimeAsync(200);

    const addCall = api.addMessage.mock.calls[0];
    expect(addCall[1].role).toBe("tool");
    expect(addCall[1].metadata).toBe(JSON.stringify({ isSubagent: true }));
  });

  it("omits metadata field when tool_call has no metadata", async () => {
    await sync.handleMessage({
      type: "tool_call",
      name: "read_file",
      input: { path: "/foo" },
    });

    await vi.advanceTimersByTimeAsync(200);

    const addCall = api.addMessage.mock.calls[0];
    expect(addCall[1]).not.toHaveProperty("metadata");
  });

  it("omits metadata field when tool_result has no metadata", async () => {
    await sync.handleMessage({
      type: "tool_result",
      output: "output",
    });

    await vi.advanceTimersByTimeAsync(200);

    const addCall = api.addMessage.mock.calls[0];
    expect(addCall[1]).not.toHaveProperty("metadata");
  });
});
