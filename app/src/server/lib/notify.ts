import { env } from "cloudflare:workers";

export async function notifyUserRoom(
  accountId: string,
  payload: Record<string, unknown>,
) {
  try {
    console.log("[notify] UserRoom: resolving DO for", accountId);
    const id = env.UserRoom.idFromName(accountId);
    const stub = env.UserRoom.get(id);
    console.log("[notify] UserRoom: sending POST...");
    const res = await stub.fetch("https://dummy/notify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("[notify] UserRoom: POST completed, status:", res.status);
  } catch (err) {
    console.error("[notify] UserRoom notification failed:", err);
  }
}

export async function notifySessionRoom(
  sessionId: string,
  payload: Record<string, unknown>,
) {
  try {
    console.log("[notify] SessionRoom: resolving DO for", sessionId);
    const id = env.SessionRoom.idFromName(sessionId);
    const stub = env.SessionRoom.get(id);
    console.log("[notify] SessionRoom: sending POST...");
    const res = await stub.fetch("https://dummy/notify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("[notify] SessionRoom: POST completed, status:", res.status);
  } catch (err) {
    console.error("[notify] SessionRoom notification failed:", err);
  }
}
