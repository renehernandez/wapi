import { and, eq, gt } from "drizzle-orm";
import { accounts, sessionMessages, sessions } from "../../../db/schema";
import type { getDb } from "../lib/db";

type Db = ReturnType<typeof getDb>;

export async function getChanges(accountId: string, sinceSeq: number, db: Db) {
  const changedSessions = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.accountId, accountId), gt(sessions.seq, sinceSeq)))
    .all();

  const changedMessages = await db
    .select()
    .from(sessionMessages)
    .where(gt(sessionMessages.accountSeq, sinceSeq))
    .all();

  // Filter messages to only those belonging to the user's sessions
  const allUserSessions = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.accountId, accountId))
    .all();
  const allUserSessionIds = new Set(allUserSessions.map((s) => s.id));

  const filteredMessages = changedMessages.filter((m) =>
    allUserSessionIds.has(m.sessionId),
  );

  const account = await db
    .select({ seq: accounts.seq })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .get();

  return {
    sessions: changedSessions,
    messages: filteredMessages,
    seq: account?.seq ?? 0,
  };
}
