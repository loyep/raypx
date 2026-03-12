import { defineRelations } from "drizzle-orm";
import { aiConversations, aiProfiles, aiProviders } from "../ai";
import { user } from "../auth";
import { searchCitations, spaceResources, spaces, spaceThreads, usageCounters } from "../workspace";

export const workspaceRelations = defineRelations(
  {
    user,
    spaces,
    spaceThreads,
    spaceResources,
    searchCitations,
    usageCounters,
    aiConversations,
    aiProviders,
    aiProfiles,
  },
  (r) => ({
    spaces: {
      user: r.one.user({
        from: r.spaces.userId,
        to: r.user.id,
      }),
      defaultProvider: r.one.aiProviders({
        from: r.spaces.defaultProviderId,
        to: r.aiProviders.id,
      }),
      promptProfile: r.one.aiProfiles({
        from: r.spaces.promptProfileId,
        to: r.aiProfiles.id,
      }),
      threads: r.many.spaceThreads({
        from: r.spaces.id,
        to: r.spaceThreads.spaceId,
      }),
      resources: r.many.spaceResources({
        from: r.spaces.id,
        to: r.spaceResources.spaceId,
      }),
      citations: r.many.searchCitations({
        from: r.spaces.id,
        to: r.searchCitations.spaceId,
      }),
    },
    spaceThreads: {
      space: r.one.spaces({
        from: r.spaceThreads.spaceId,
        to: r.spaces.id,
      }),
      conversation: r.one.aiConversations({
        from: r.spaceThreads.conversationId,
        to: r.aiConversations.id,
      }),
    },
    spaceResources: {
      space: r.one.spaces({
        from: r.spaceResources.spaceId,
        to: r.spaces.id,
      }),
    },
    searchCitations: {
      user: r.one.user({
        from: r.searchCitations.userId,
        to: r.user.id,
      }),
      space: r.one.spaces({
        from: r.searchCitations.spaceId,
        to: r.spaces.id,
      }),
      conversation: r.one.aiConversations({
        from: r.searchCitations.conversationId,
        to: r.aiConversations.id,
      }),
    },
    usageCounters: {
      user: r.one.user({
        from: r.usageCounters.userId,
        to: r.user.id,
      }),
    },
  }),
);
