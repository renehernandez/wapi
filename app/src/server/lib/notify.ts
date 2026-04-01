import { env } from "cloudflare:workers";
import { getRequestContext } from "./request-context";

export function notifyUserRoom(
  accountId: string,
  payload: Record<string, unknown>,
): Promise<void> | undefined {
  const promise = (async () => {
    const id = env.UserRoom.idFromName(accountId);
    const stub = env.UserRoom.get(id);
    await stub.fetch("https://dummy/notify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  })().catch((err) =>
    console.error("[notify] UserRoom notification failed:", err),
  );

  const ctx = getRequestContext();
  if (ctx) {
    ctx.waitUntil(promise);
    return undefined;
  }
  // No context — return the promise so callers can await it
  return promise;
}

export function notifySessionRoom(
  sessionId: string,
  payload: Record<string, unknown>,
): Promise<void> | undefined {
  const promise = (async () => {
    const id = env.SessionRoom.idFromName(sessionId);
    const stub = env.SessionRoom.get(id);
    await stub.fetch("https://dummy/notify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  })().catch((err) =>
    console.error("[notify] SessionRoom notification failed:", err),
  );

  const ctx = getRequestContext();
  if (ctx) {
    ctx.waitUntil(promise);
    return undefined;
  }
  return promise;
}
