import { env } from "cloudflare:workers";
import handler from "@tanstack/react-start/server-entry";
import { routePartykitRequest } from "partyserver";
import { runWithContext } from "./server/lib/request-context";

export { UserRoom } from "./parties/user";
export { SessionRoom } from "./parties/session";

export default {
  async fetch(
    request: Request,
    _env: unknown,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // WebSocket upgrades → Durable Objects
    const partyResponse = await routePartykitRequest(
      request,
      env as unknown as Record<string, unknown>,
    );
    if (partyResponse) return partyResponse;

    // Propagate ExecutionContext via AsyncLocalStorage so server functions
    // can use ctx.waitUntil() for non-blocking background work
    return runWithContext({ waitUntil: (p) => ctx.waitUntil(p) }, () =>
      handler.fetch(request),
    ) as Promise<Response>;
  },
};
