import { z } from "zod";

export const CreateSessionRequest = z.object({
  title: z.string().optional(),
  agentType: z.string().optional(),
  machineId: z.string().optional(),
  metadata: z.string().optional(),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequest>;

export const UpdateSessionRequest = z.object({
  id: z.string(),
  title: z.string().optional(),
  status: z.enum(["active", "ended", "archived"]).optional(),
  metadata: z.string().optional(),
  expectedVersion: z.number(),
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequest>;

export const ListSessionsRequest = z.object({
  status: z.enum(["active", "ended", "archived"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});
export type ListSessionsRequest = z.infer<typeof ListSessionsRequest>;

export const SessionResponse = z.object({
  id: z.string(),
  accountId: z.string(),
  title: z.string().nullable(),
  agentType: z.string().nullable(),
  machineId: z.string().nullable(),
  status: z.string(),
  metadata: z.string().nullable(),
  version: z.number(),
  seq: z.number(),
  messageCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SessionResponse = z.infer<typeof SessionResponse>;

export const AddMessageRequest = z.object({
  sessionId: z.string(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  metadata: z.string().optional(),
});
export type AddMessageRequest = z.infer<typeof AddMessageRequest>;

export const ListMessagesRequest = z.object({
  sessionId: z.string(),
  afterSeq: z.number().optional(),
  limit: z.number().optional(),
});
export type ListMessagesRequest = z.infer<typeof ListMessagesRequest>;

export const MessageResponse = z.object({
  id: z.string(),
  sessionId: z.string(),
  seq: z.number(),
  role: z.string(),
  content: z.string(),
  metadata: z.string().nullable(),
  accountSeq: z.number(),
  createdAt: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponse>;

export const GetChangesRequest = z.object({
  sinceSeq: z.number(),
});
export type GetChangesRequest = z.infer<typeof GetChangesRequest>;

export const GetChangesResponse = z.object({
  sessions: z.array(SessionResponse),
  messages: z.array(MessageResponse),
  seq: z.number(),
});
export type GetChangesResponse = z.infer<typeof GetChangesResponse>;
