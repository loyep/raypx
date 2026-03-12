import { and, desc, eq, ilike, or } from "@raypx/database";
import { searchCitations, spaceResources } from "@raypx/database/schemas";

type SearchContext = {
  db: any;
  user: { id: string };
};

export const searchService = {
  async webSearch(
    context: SearchContext,
    input: { query: string; limit: number; spaceId?: string },
  ) {
    const citations = await context.db
      .select()
      .from(searchCitations)
      .where(
        and(
          eq(searchCitations.userId, context.user.id),
          ilike(searchCitations.query, `%${input.query.trim()}%`),
          ...(input.spaceId ? [eq(searchCitations.spaceId, input.spaceId)] : []),
        ),
      )
      .orderBy(desc(searchCitations.createdAt))
      .limit(input.limit);

    return {
      query: input.query,
      source: citations.length > 0 ? "history" : "stub",
      citations:
        citations.length > 0
          ? citations
          : [
              {
                id: `preview-${input.query}`,
                title: `Search is not wired yet for "${input.query}"`,
                url: "https://raypx.com/docs",
                snippet:
                  "This search domain is scaffolded so web search, citations, and retrieval can evolve independently from chat.",
                sourceType: "web",
                position: 0,
              },
            ],
    };
  },

  async listCitations(
    context: SearchContext,
    input: { conversationId?: string; spaceId?: string },
  ) {
    const rows = await context.db
      .select()
      .from(searchCitations)
      .where(
        and(
          eq(searchCitations.userId, context.user.id),
          ...(input.conversationId
            ? [eq(searchCitations.conversationId, input.conversationId)]
            : []),
          ...(input.spaceId ? [eq(searchCitations.spaceId, input.spaceId)] : []),
        ),
      )
      .orderBy(desc(searchCitations.createdAt));

    return { citations: rows };
  },

  async retrieveFromSpace(
    context: SearchContext,
    input: { spaceId: string; query: string; limit: number },
  ) {
    const rows = await context.db
      .select()
      .from(spaceResources)
      .where(
        and(
          eq(spaceResources.spaceId, input.spaceId),
          or(
            ilike(spaceResources.title, `%${input.query.trim()}%`),
            ilike(spaceResources.url, `%${input.query.trim()}%`),
            ilike(spaceResources.filePath, `%${input.query.trim()}%`),
          ),
        ),
      )
      .orderBy(desc(spaceResources.updatedAt))
      .limit(input.limit);

    return { items: rows };
  },
};
