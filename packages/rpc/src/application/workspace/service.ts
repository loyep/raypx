import { and, desc, eq, ilike, or } from "@raypx/database";
import { aiConversations, spaceResources, spaces, spaceThreads } from "@raypx/database/schemas";

type WorkspaceContext = {
  db: any;
  user: { id: string };
};

type CreateSpaceInput = {
  title: string;
  description?: string | null;
  colorToken?: string | null;
  icon?: string | null;
  defaultProviderId?: string | null;
  promptProfileId?: string | null;
};

type UpdateSpaceInput = CreateSpaceInput & {
  spaceId: string;
  isArchived?: boolean;
};

type ListSpaceFilesInput = {
  spaceId: string;
  query?: string;
};

type ListSpaceThreadsInput = {
  spaceId: string;
};

function toSpaceInsert(context: WorkspaceContext, input: CreateSpaceInput) {
  return {
    userId: context.user.id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    colorToken: input.colorToken?.trim() || null,
    icon: input.icon?.trim() || null,
    defaultProviderId: input.defaultProviderId ?? null,
    promptProfileId: input.promptProfileId ?? null,
  };
}

export const workspaceService = {
  async listSpaces(context: WorkspaceContext) {
    return context.db
      .select()
      .from(spaces)
      .where(eq(spaces.userId, context.user.id))
      .orderBy(desc(spaces.updatedAt));
  },

  async getSpace(context: WorkspaceContext, input: { spaceId: string }) {
    const [space] = await context.db
      .select()
      .from(spaces)
      .where(and(eq(spaces.id, input.spaceId), eq(spaces.userId, context.user.id)))
      .limit(1);

    return space ?? null;
  },

  async createSpace(context: WorkspaceContext, input: CreateSpaceInput) {
    const [space] = await context.db
      .insert(spaces)
      .values(toSpaceInsert(context, input))
      .returning();
    return space;
  },

  async updateSpace(context: WorkspaceContext, input: UpdateSpaceInput) {
    const [space] = await context.db
      .update(spaces)
      .set({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        colorToken: input.colorToken?.trim() || null,
        icon: input.icon?.trim() || null,
        defaultProviderId: input.defaultProviderId ?? null,
        promptProfileId: input.promptProfileId ?? null,
        ...(input.isArchived === undefined ? {} : { isArchived: input.isArchived }),
      })
      .where(and(eq(spaces.id, input.spaceId), eq(spaces.userId, context.user.id)))
      .returning();

    return space ?? null;
  },

  async deleteSpace(context: WorkspaceContext, input: { spaceId: string }) {
    const [space] = await context.db
      .delete(spaces)
      .where(and(eq(spaces.id, input.spaceId), eq(spaces.userId, context.user.id)))
      .returning();

    return space ?? null;
  },

  async listSpaceFiles(context: WorkspaceContext, input: ListSpaceFilesInput) {
    const conditions = [
      eq(spaceResources.spaceId, input.spaceId),
      eq(spaceResources.resourceType, "file"),
    ];

    if (input.query?.trim()) {
      const queryCondition = or(
        ilike(spaceResources.title, `%${input.query.trim()}%`),
        ilike(spaceResources.filePath, `%${input.query.trim()}%`),
      );
      if (queryCondition) {
        conditions.push(queryCondition);
      }
    }

    const ownedSpace = await this.getSpace(context, { spaceId: input.spaceId });
    if (!ownedSpace) return [];

    return context.db
      .select()
      .from(spaceResources)
      .where(and(...conditions))
      .orderBy(desc(spaceResources.updatedAt));
  },

  async listSpaceThreads(context: WorkspaceContext, input: ListSpaceThreadsInput) {
    const ownedSpace = await this.getSpace(context, { spaceId: input.spaceId });
    if (!ownedSpace) return [];

    const rows = await context.db
      .select({
        id: aiConversations.id,
        title: aiConversations.title,
        model: aiConversations.model,
        provider: aiConversations.provider,
        updatedAt: aiConversations.updatedAt,
        pinned: spaceThreads.pinned,
      })
      .from(spaceThreads)
      .innerJoin(aiConversations, eq(spaceThreads.conversationId, aiConversations.id))
      .where(eq(spaceThreads.spaceId, input.spaceId))
      .orderBy(desc(spaceThreads.createdAt));

    return rows;
  },
};
