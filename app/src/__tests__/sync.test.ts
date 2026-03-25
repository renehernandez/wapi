import { beforeAll, describe, expect, it } from "vitest";
import { addMessage } from "~/server/functions/messages";
import { createSession, updateSession } from "~/server/functions/sessions";
import { getChanges } from "~/server/functions/sync";
import { applyMigrations, getTestDb } from "~/test/apply-migrations";
import { accounts } from "../../db/schema";

let db: ReturnType<typeof getTestDb>;

beforeAll(async () => {
  await applyMigrations();
  db = getTestDb();
  await db.insert(accounts).values({
    id: "acc-sync",
    email: "sync@example.com",
    seq: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

describe("getChanges", () => {
  it("returns all data when sinceSeq is 0", async () => {
    const s1 = await createSession("acc-sync", { title: "Session 1" }, db);
    const s2 = await createSession("acc-sync", { title: "Session 2" }, db);
    await addMessage(
      "acc-sync",
      { sessionId: s1.id, role: "user", content: "msg1" },
      db,
    );
    await addMessage(
      "acc-sync",
      { sessionId: s2.id, role: "assistant", content: "msg2" },
      db,
    );

    const changes = await getChanges("acc-sync", 0, db);

    expect(changes.sessions.length).toBe(2);
    expect(changes.messages.length).toBe(2);
    expect(changes.seq).toBeGreaterThan(0);
  });

  it("returns incremental changes", async () => {
    // Get current seq
    const baseline = await getChanges("acc-sync", 0, db);
    const currentSeq = baseline.seq;

    // Create new data after baseline
    const s3 = await createSession("acc-sync", { title: "Session 3" }, db);
    await addMessage(
      "acc-sync",
      { sessionId: s3.id, role: "user", content: "new msg" },
      db,
    );

    const changes = await getChanges("acc-sync", currentSeq, db);

    expect(changes.sessions.length).toBe(1);
    expect(changes.sessions[0].title).toBe("Session 3");
    expect(changes.messages.length).toBe(1);
    expect(changes.messages[0].content).toBe("new msg");
  });

  it("returns empty when no changes", async () => {
    const current = await getChanges("acc-sync", 0, db);
    const changes = await getChanges("acc-sync", current.seq, db);

    expect(changes.sessions.length).toBe(0);
    expect(changes.messages.length).toBe(0);
  });
});

describe("Integration: optimistic concurrency", () => {
  it("succeeds with correct version, fails with stale version", async () => {
    const session = await createSession(
      "acc-sync",
      { title: "Concurrency test" },
      db,
    );

    // Update with correct version
    const updated = await updateSession(
      session.id,
      "acc-sync",
      { title: "V2", expectedVersion: 1 },
      db,
    );
    expect(updated!.title).toBe("V2");

    // Try to update with stale version
    await expect(
      updateSession(
        session.id,
        "acc-sync",
        { title: "Should fail", expectedVersion: 1 },
        db,
      ),
    ).rejects.toThrow("Version conflict");
  });
});
