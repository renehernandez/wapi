import { sql } from "drizzle-orm";
import { sessionMessages } from "../../../db/schema";
import type { getDb } from "./db";

type Db = ReturnType<typeof getDb>;

export async function incrementSeq(accountId: string, db: Db): Promise<number> {
  const result = await db.run(
    sql`UPDATE accounts SET seq = seq + 1 WHERE id = ${accountId} RETURNING seq`,
  );
  const row = result.results?.[0] as { seq: number } | undefined;
  if (!row) throw new Error(`Account not found: ${accountId}`);
  return row.seq;
}

export async function nextMessageSeq(
  sessionId: string,
  db: Db,
): Promise<number> {
  const result = await db
    .select({ maxSeq: sql<number>`COALESCE(MAX(${sessionMessages.seq}), 0)` })
    .from(sessionMessages)
    .where(sql`${sessionMessages.sessionId} = ${sessionId}`)
    .get();

  return (result?.maxSeq ?? 0) + 1;
}
