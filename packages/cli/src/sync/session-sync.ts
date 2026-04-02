import consola from "consola";
import type { AgentMessage } from "../adapters/types";
import type { ApiClient } from "../api";

const FLUSH_INTERVAL_MS = 200;

export class SessionSync {
  private sessionId: string | null = null;
  private sessionVersion = 1;
  private started = false;
  private buffer: Array<{
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    metadata?: string;
  }> = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  constructor(
    private api: ApiClient,
    private agentType: string,
    private machineId?: string,
  ) {}

  async handleMessage(msg: AgentMessage): Promise<void> {
    // Create session lazily on first message
    if (!this.started) {
      this.started = true;
      try {
        const session = await this.api.createSession({
          agentType: this.agentType,
          machineId: this.machineId,
        });
        this.sessionId = session.id;
        this.sessionVersion = session.version;
        consola.debug(`Session created: ${this.sessionId}`);
        this.startFlushTimer();
      } catch (err) {
        consola.warn(
          `Failed to create session: ${err instanceof Error ? err.message : String(err)}`,
        );
        return;
      }
    }

    if (!this.sessionId) return;

    const mapped = this.mapMessage(msg);
    if (!mapped) return;

    this.buffer.push(mapped);
  }

  async end(): Promise<void> {
    this.stopFlushTimer();
    await this.flush();

    if (!this.sessionId) return;

    try {
      await this.api.updateSession(this.sessionId, {
        status: "ended",
        expectedVersion: this.sessionVersion,
      });
      consola.debug(`Session ended: ${this.sessionId}`);
    } catch (err) {
      consola.debug(
        `Failed to end session: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch((err) =>
        consola.debug(
          `Flush failed: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );
    }, FLUSH_INTERVAL_MS);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.buffer.length === 0 || !this.sessionId) return;

    this.flushing = true;
    const batch = this.buffer.splice(0);

    try {
      if (batch.length === 1) {
        await this.api.addMessage(this.sessionId, batch[0]);
      } else {
        await this.api.addMessages(this.sessionId, batch);
      }
    } catch (err) {
      consola.debug(
        `Failed to sync ${batch.length} message(s): ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      this.flushing = false;
    }
  }

  private mapMessage(msg: AgentMessage): {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    metadata?: string;
  } | null {
    switch (msg.type) {
      case "text":
        return {
          role: msg.role,
          content: msg.content,
          ...(msg.metadata ? { metadata: JSON.stringify(msg.metadata) } : {}),
        };
      case "tool_call":
        return {
          role: "tool",
          content: JSON.stringify({
            type: "tool_call",
            name: msg.name,
            input: msg.input,
          }),
          ...(msg.metadata ? { metadata: JSON.stringify(msg.metadata) } : {}),
        };
      case "tool_result":
        return {
          role: "tool",
          content: JSON.stringify({ type: "tool_result", output: msg.output }),
          ...(msg.metadata ? { metadata: JSON.stringify(msg.metadata) } : {}),
        };
      case "error":
        return { role: "system", content: `Error: ${msg.message}` };
      case "thinking":
        return { role: "assistant", content: msg.content };
      case "turn_complete":
        return null;
    }
  }
}
