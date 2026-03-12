import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgTable, timestamptz, uuidv7 } from "../../utils";
import { aiConversations, aiProfiles, aiProviders } from "./ai";
import { user } from "./auth";

export const spaces = pgTable(
  "spaces",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    colorToken: text("color_token"),
    icon: text("icon"),
    defaultProviderId: uuid("default_provider_id").references(() => aiProviders.id, {
      onDelete: "set null",
    }),
    promptProfileId: uuid("prompt_profile_id").references(() => aiProfiles.id, {
      onDelete: "set null",
    }),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_spaces_user_id_updated_at").on(table.userId, table.updatedAt),
    index("idx_spaces_user_id_archived").on(table.userId, table.isArchived),
    index("idx_spaces_default_provider_id").on(table.defaultProviderId),
    index("idx_spaces_prompt_profile_id").on(table.promptProfileId),
  ],
);

export const spaceThreads = pgTable(
  "space_threads",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("uidx_space_threads_space_conversation").on(table.spaceId, table.conversationId),
    index("idx_space_threads_space_id_created_at").on(table.spaceId, table.createdAt),
  ],
);

export const spaceResources = pgTable(
  "space_resources",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    filePath: text("file_path"),
    mimeType: text("mime_type"),
    metadata: jsonb("metadata"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_space_resources_space_id_updated_at").on(table.spaceId, table.updatedAt),
    index("idx_space_resources_space_id_type").on(table.spaceId, table.resourceType),
    check("chk_space_resources_type_valid", sql`${table.resourceType} IN ('file', 'link', 'note')`),
  ],
);

export const searchCitations = pgTable(
  "search_citations",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id").references(() => aiConversations.id, {
      onDelete: "cascade",
    }),
    spaceId: uuid("space_id").references(() => spaces.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    snippet: text("snippet"),
    sourceType: text("source_type").notNull().default("web"),
    position: integer("position").notNull().default(0),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_search_citations_user_id_created_at").on(table.userId, table.createdAt),
    index("idx_search_citations_conversation_id").on(table.conversationId),
    index("idx_search_citations_space_id").on(table.spaceId),
    check("chk_search_citations_position_non_negative", sql`${table.position} >= 0`),
  ],
);

export const usageCounters = pgTable(
  "usage_counters",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(),
    periodStart: timestamptz("period_start").notNull(),
    periodEnd: timestamptz("period_end").notNull(),
    quantity: integer("quantity").notNull().default(0),
    metadata: jsonb("metadata"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("uidx_usage_counters_user_feature_period").on(
      table.userId,
      table.feature,
      table.periodStart,
    ),
    index("idx_usage_counters_user_id_period_end").on(table.userId, table.periodEnd),
    check("chk_usage_counters_quantity_non_negative", sql`${table.quantity} >= 0`),
    check("chk_usage_counters_period_valid", sql`${table.periodEnd} >= ${table.periodStart}`),
  ],
);
