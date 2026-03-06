import type { DatabaseClient } from "@raypx/database";
import { and, asc, desc, eq } from "@raypx/database";
import { aiCallLogs, aiConversations, aiMessages } from "@raypx/database/schemas";
import type { StreamTrace } from "../types";

export async function createConversation(
  db: DatabaseClient,
  input: {
    userId: string;
    title: string;
    provider: string;
    providerId?: string | null;
    model: string;
  },
) {
  const rows = await db
    .insert(aiConversations)
    .values({
      userId: input.userId,
      title: input.title,
      provider: input.provider,
      providerId: input.providerId ?? null,
      model: input.model,
    })
    .returning();

  const conversation = rows[0];
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }
  return conversation;
}

export async function listConversations(
  db: DatabaseClient,
  input: {
    userId: string;
    limit: number;
    offset: number;
  },
) {
  const items = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, input.userId))
    .orderBy(desc(aiConversations.updatedAt))
    .limit(input.limit)
    .offset(input.offset);

  return items;
}

export async function getConversationWithMessages(
  db: DatabaseClient,
  input: {
    userId: string;
    conversationId: string;
  },
) {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(
      and(eq(aiConversations.id, input.conversationId), eq(aiConversations.userId, input.userId)),
    )
    .limit(1);

  if (!conversation) {
    return null;
  }

  const messages = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversation.id))
    .orderBy(asc(aiMessages.createdAt));

  return { conversation, messages };
}

export async function appendMessage(
  db: DatabaseClient,
  input: {
    conversationId: string;
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, unknown> | null;
    tokens?: number | null;
  },
) {
  const rows = await db
    .insert(aiMessages)
    .values({
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      metadata: input.metadata ?? null,
      tokens: input.tokens ?? null,
    })
    .returning();

  const message = rows[0];
  if (!message) {
    throw new Error("Failed to append message");
  }

  await db
    .update(aiConversations)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(aiConversations.id, input.conversationId));

  return message;
}

export async function deleteConversation(
  db: DatabaseClient,
  input: {
    userId: string;
    conversationId: string;
  },
) {
  const rows = await db
    .delete(aiConversations)
    .where(
      and(eq(aiConversations.id, input.conversationId), eq(aiConversations.userId, input.userId)),
    )
    .returning();

  return rows[0] ?? null;
}

export async function updateConversationTitle(
  db: DatabaseClient,
  input: {
    userId: string;
    conversationId: string;
    title: string;
  },
) {
  const rows = await db
    .update(aiConversations)
    .set({
      title: input.title,
      updatedAt: new Date(),
    })
    .where(
      and(eq(aiConversations.id, input.conversationId), eq(aiConversations.userId, input.userId)),
    )
    .returning();

  return rows[0] ?? null;
}

export async function persistCallLog(db: DatabaseClient, trace: StreamTrace) {
  const endedAt = trace.finishedAt ? new Date(trace.finishedAt) : new Date();
  await db.insert(aiCallLogs).values({
    traceId: trace.traceId,
    userId: trace.userId,
    route: trace.route,
    provider: trace.provider,
    model: trace.model,
    inputTokens: trace.usage.inputTokens,
    outputTokens: trace.usage.outputTokens,
    totalTokens: trace.usage.totalTokens,
    ttftMs: trace.firstChunkAt ? trace.firstChunkAt - trace.startedAt : null,
    chunkCount: trace.chunkCount,
    charCount: trace.charCount,
    latencyMs: (trace.finishedAt ?? Date.now()) - trace.startedAt,
    status: trace.status,
    errorCode: trace.errorCode,
    requestId: trace.requestId,
    costUsdCents: trace.usage.costUsdCents,
    metadata: {
      promptLength: trace.promptLength,
    },
    endedAt,
  });
}
