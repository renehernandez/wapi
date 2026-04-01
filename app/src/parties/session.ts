import { Server } from "partyserver";

export class SessionRoom extends Server {
  static options = { hibernate: true };

  onConnect(_connection: any) {
    // Connection established — client viewing this session
  }

  onMessage(_connection: any, message: string | ArrayBuffer) {
    const data =
      typeof message === "string" ? message : new TextDecoder().decode(message);
    this.broadcast(data);
  }

  async onRequest(request: Request): Promise<Response> {
    // Server functions send full message content via HTTP POST
    if (request.method === "POST") {
      const body = await request.text();
      const connections = [...this.getConnections()];
      console.log(
        `[SessionRoom] Broadcasting to ${connections.length} connections`,
      );
      this.broadcast(body);
      return new Response("ok");
    }
    return new Response("Method not allowed", { status: 405 });
  }
}
