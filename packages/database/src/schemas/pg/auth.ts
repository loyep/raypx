import { boolean, index, integer, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, timestamptz, uuidv7 } from "../../utils";
import { organization } from "./organizations";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    createdAt: timestamptz("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
    username: text("username").unique(),
    displayUsername: text("display_username"),
    role: text("role"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamptz("ban_expires"),
  },
  (table) => [
    index("idx_user_email").on(table.email),
    index("idx_user_username").on(table.username),
  ],
);

export const CreateUserSchema = createInsertSchema(user);

export const passkey = pgTable("passkey", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_id").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamptz("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamptz("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
  aaguid: text("aaguid"),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    expiresAt: timestamptz("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamptz("created_at").defaultNow().notNull(),
    updatedAt: timestamptz("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
    lastActive: timestamptz("last_active")
      .notNull()
      .$defaultFn(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [
    index("idx_session_token").on(table.token),
    index("idx_session_user_id").on(table.userId),
    index("idx_session_expires_at").on(table.expiresAt),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamptz("access_token_expires_at"),
    refreshTokenExpiresAt: timestamptz("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [uniqueIndex("uidx_account_provider_account").on(table.providerId, table.accountId)],
);

export const verification = pgTable("verification", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamptz("expires_at").notNull(),
  createdAt: timestamptz("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamptz("updated_at")
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const apikey = pgTable(
  "apikey",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name"),
    start: text("start"),
    prefix: text("prefix"),
    key: text("key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamptz("last_refill_at"),
    enabled: boolean("enabled").default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true),
    rateLimitTimeWindow: integer("rate_limit_time_window").default(86_400_000),
    rateLimitMax: integer("rate_limit_max").default(10),
    requestCount: integer("request_count").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamptz("last_request"),
    expiresAt: timestamptz("expires_at"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$onUpdateFn(() => new Date()),
    permissions: text("permissions"),
    metadata: text("metadata"),
  },
  (table) => [index("idx_apikey_user_id").on(table.userId), index("idx_apikey_key").on(table.key)],
);

export const member = pgTable(
  "member",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [uniqueIndex("uidx_member_org_user").on(table.organizationId, table.userId)],
);

export const invitation = pgTable("invitation", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamptz("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const oauthApplication = pgTable("oauth_application", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name"),
  icon: text("icon"),
  metadata: text("metadata"),
  clientId: text("client_id").unique(),
  clientSecret: text("client_secret"),
  redirectURLs: text("redirect_u_r_ls"),
  type: text("type"),
  disabled: boolean("disabled").default(false),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamptz("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamptz("updated_at")
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const oauthAccessToken = pgTable("oauth_access_token", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  accessToken: text("access_token").unique(),
  refreshToken: text("refresh_token").unique(),
  accessTokenExpiresAt: timestamptz("access_token_expires_at"),
  refreshTokenExpiresAt: timestamptz("refresh_token_expires_at"),
  clientId: text("client_id").references(() => oauthApplication.clientId, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes"),
  createdAt: timestamptz("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamptz("updated_at")
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const oauthConsent = pgTable("oauth_consent", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  clientId: text("client_id").references(() => oauthApplication.clientId, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes"),
  createdAt: timestamptz("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamptz("updated_at")
    .notNull()
    .$onUpdateFn(() => new Date()),
  consentGiven: boolean("consent_given"),
});

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamptz("created_at").notNull(),
  expiresAt: timestamptz("expires_at"),
});
