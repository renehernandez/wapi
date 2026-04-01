import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock cloudflare:workers env
const mockFetch = vi.fn().mockResolvedValue(new Response("ok"));
const mockGet = vi.fn().mockReturnValue({ fetch: mockFetch });
const mockIdFromName = vi.fn().mockReturnValue("mock-id");

vi.mock("cloudflare:workers", () => ({
  env: {
    UserRoom: {
      idFromName: mockIdFromName,
      get: mockGet,
    },
    SessionRoom: {
      idFromName: mockIdFromName,
      get: mockGet,
    },
  },
}));

// Mock request-context — no context by default (fallback to await)
const mockGetRequestContext = vi.fn().mockReturnValue(undefined);
vi.mock("../request-context", () => ({
  getRequestContext: () => mockGetRequestContext(),
}));

const { notifyUserRoom, notifySessionRoom } = await import("../notify");

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue(new Response("ok"));
  mockGetRequestContext.mockReturnValue(undefined);
});

describe("notifyUserRoom", () => {
  it("sends POST to UserRoom DO with JSON payload (no context — await fallback)", async () => {
    const result = notifyUserRoom("acc-123", {
      type: "session_created",
      sessionId: "s-1",
      title: "Test",
    });

    // Should return a promise when no context
    expect(result).toBeInstanceOf(Promise);
    await result;

    expect(mockIdFromName).toHaveBeenCalledWith("acc-123");
    expect(mockGet).toHaveBeenCalledWith("mock-id");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://dummy/notify",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: "session_created",
          sessionId: "s-1",
          title: "Test",
        }),
      }),
    );
  });

  it("uses waitUntil and returns undefined when context is available", async () => {
    const mockWaitUntil = vi.fn();
    mockGetRequestContext.mockReturnValue({ waitUntil: mockWaitUntil });

    const result = notifyUserRoom("acc-123", { type: "session_created" });

    expect(result).toBeUndefined();
    expect(mockWaitUntil).toHaveBeenCalledTimes(1);

    // Wait for the background promise
    await mockWaitUntil.mock.calls[0][0];
    expect(mockFetch).toHaveBeenCalled();
  });

  it("does not throw on fetch failure", async () => {
    mockFetch.mockRejectedValue(new Error("DO unavailable"));

    const result = notifyUserRoom("acc-123", { type: "session_created" });
    if (result) await expect(result).resolves.not.toThrow();
  });

  it("does not throw on idFromName failure", () => {
    mockIdFromName.mockImplementationOnce(() => {
      throw new Error("bad id");
    });

    const result = notifyUserRoom("acc-123", { type: "test" });
    // Error is caught — result is a resolved promise
    expect(result).toBeInstanceOf(Promise);
  });
});

describe("notifySessionRoom", () => {
  it("sends POST to SessionRoom DO with full message", async () => {
    const result = notifySessionRoom("s-456", {
      type: "message",
      id: "m-1",
      seq: 5,
      role: "assistant",
      content: "Hello",
      createdAt: "2026-01-01T00:00:00Z",
    });

    await result;

    expect(mockIdFromName).toHaveBeenCalledWith("s-456");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://dummy/notify",
      expect.objectContaining({ method: "POST" }),
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.type).toBe("message");
    expect(body.content).toBe("Hello");
    expect(body.seq).toBe(5);
  });

  it("does not throw on failure", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));

    const result = notifySessionRoom("s-456", { type: "message" });
    if (result) await expect(result).resolves.not.toThrow();
  });
});
