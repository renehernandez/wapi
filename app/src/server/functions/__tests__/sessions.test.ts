import { beforeAll, describe, expect, it } from "vitest";
import { applyMigrations, getTestDb } from "~/test/apply-migrations";
import { accounts } from "../../../../db/schema";
import {
  VersionConflictError,
  createSession,
  deleteSession,
  getSession,
  listSessions,
  updateSession,
} from "../sessions";

let db: ReturnType<typeof getTestDb>;

beforeAll(async () => {
  await applyMigrations();
  db = getTestDb();
  await db.insert(accounts).values({
    id: "acc-sess",
    email: "sessions@example.com",
    seq: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

describe("createSession", () => {
  it("creates a session with active status and assigns seq", async () => {
    const session = await createSession(
      "acc-sess",
      { title: "Test session", agentType: "claude" },
      db,
    );

    expect(session.id).toBeDefined();
    expect(session.status).toBe("active");
    expect(session.version).toBe(1);
    expect(session.seq).toBeGreaterThan(0);
    expect(session.title).toBe("Test session");
    expect(session.agentType).toBe("claude");
  });

  it("creates session with minimal fields", async () => {
    const session = await createSession("acc-sess", {}, db);
    expect(session.title).toBeNull();
    expect(session.agentType).toBeNull();
  });
});

describe("getSession", () => {
  it("returns session with message count", async () => {
    const created = await createSession("acc-sess", { title: "Get test" }, db);
    const session = await getSession(created.id, "acc-sess", db);

    expect(session).not.toBeNull();
    expect(session!.messageCount).toBe(0);
  });

  it("returns null for nonexistent session", async () => {
    const session = await getSession("nonexistent", "acc-sess", db);
    expect(session).toBeNull();
  });
});

describe("listSessions", () => {
  it("lists sessions ordered by updatedAt desc", async () => {
    const list = await listSessions("acc-sess", {}, db);
    expect(list.length).toBeGreaterThan(0);
  });

  it("filters by status", async () => {
    const list = await listSessions("acc-sess", { status: "active" }, db);
    for (const s of list) {
      expect(s.status).toBe("active");
    }
  });
});

describe("updateSession", () => {
  it("updates title with correct version", async () => {
    const session = await createSession("acc-sess", { title: "Original" }, db);
    const updated = await updateSession(
      session.id,
      "acc-sess",
      { title: "Updated", expectedVersion: 1 },
      db,
    );

    expect(updated!.title).toBe("Updated");
  });

  it("throws on version conflict", async () => {
    const session = await createSession(
      "acc-sess",
      { title: "Conflict test" },
      db,
    );

    await expect(
      updateSession(
        session.id,
        "acc-sess",
        { title: "Bad update", expectedVersion: 99 },
        db,
      ),
    ).rejects.toThrow(VersionConflictError);
  });
});

describe("deleteSession", () => {
  it("soft deletes by setting status to archived", async () => {
    const session = await createSession("acc-sess", { title: "To delete" }, db);
    await deleteSession(session.id, "acc-sess", db);

    const deleted = await getSession(session.id, "acc-sess", db);
    expect(deleted!.status).toBe("archived");
  });
});
