import { beforeAll, describe, expect, it } from "vitest";
import { applyMigrations, getTestDb } from "~/test/apply-migrations";
import { accounts } from "../../../../db/schema";
import { addMessage, getMessage, listMessages } from "../messages";
import { createSession } from "../sessions";

let db: ReturnType<typeof getTestDb>;
let sessionId: string;

beforeAll(async () => {
  await applyMigrations();
  db = getTestDb();
  await db.insert(accounts).values({
    id: "acc-msg",
    email: "messages@example.com",
    seq: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const session = await createSession(
    "acc-msg",
    { title: "Message test session" },
    db,
  );
  sessionId = session.id;
});

describe("addMessage", () => {
  it("assigns seq=1 for first message", async () => {
    const msg = await addMessage(
      "acc-msg",
      { sessionId, role: "user", content: "Hello" },
      db,
    );

    expect(msg.seq).toBe(1);
    expect(msg.role).toBe("user");
    expect(msg.content).toBe("Hello");
    expect(msg.accountSeq).toBeGreaterThan(0);
  });

  it("assigns incrementing seq for subsequent messages", async () => {
    const msg2 = await addMessage(
      "acc-msg",
      { sessionId, role: "assistant", content: "Hi there" },
      db,
    );
    const msg3 = await addMessage(
      "acc-msg",
      { sessionId, role: "user", content: "How are you?" },
      db,
    );

    expect(msg2.seq).toBe(2);
    expect(msg3.seq).toBe(3);
  });

  it("throws for nonexistent session", async () => {
    await expect(
      addMessage(
        "acc-msg",
        { sessionId: "nonexistent", role: "user", content: "test" },
        db,
      ),
    ).rejects.toThrow("Session not found");
  });
});

describe("listMessages", () => {
  it("returns messages ordered by seq", async () => {
    const msgs = await listMessages("acc-msg", { sessionId }, db);

    expect(msgs.length).toBe(3);
    expect(msgs[0].seq).toBe(1);
    expect(msgs[1].seq).toBe(2);
    expect(msgs[2].seq).toBe(3);
  });

  it("filters by afterSeq", async () => {
    const msgs = await listMessages("acc-msg", { sessionId, afterSeq: 1 }, db);
    expect(msgs.length).toBe(2);
    expect(msgs[0].seq).toBe(2);
  });

  it("respects limit", async () => {
    const msgs = await listMessages("acc-msg", { sessionId, limit: 1 }, db);
    expect(msgs.length).toBe(1);
  });
});

describe("getMessage", () => {
  it("returns a single message", async () => {
    const msgs = await listMessages("acc-msg", { sessionId, limit: 1 }, db);
    const msg = await getMessage("acc-msg", sessionId, msgs[0].id, db);

    expect(msg).not.toBeNull();
    expect(msg!.id).toBe(msgs[0].id);
  });

  it("returns null for nonexistent message", async () => {
    const msg = await getMessage("acc-msg", sessionId, "nonexistent", db);
    expect(msg).toBeNull();
  });
});
