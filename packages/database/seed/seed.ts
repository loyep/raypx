import { and, eq, inArray, like } from "drizzle-orm";
import { createClientWithConnection } from "../src/adapters/postgres";
import * as schemas from "../src/schemas/pg";
import { uuidv7 } from "../src/utils";
import {
  CONVERSATIONS_PER_USER,
  MESSAGES_PER_CONVERSATION,
  ORG_COUNT,
  SEEDED_EMAIL_PATTERN,
  SEEDED_ORG_SLUG_PATTERN,
  SEEDED_USERNAME_PREFIX,
  USER_COUNT,
} from "./config";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function pad3(input: number): string {
  return input.toString().padStart(3, "0");
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const { db, close } = createClientWithConnection({ databaseUrl });
  const dryRun = hasFlag("--dry-run");

  if (dryRun) {
    process.stdout.write(
      `${JSON.stringify(
        {
          mode: "dry-run",
          users: USER_COUNT,
          organizations: ORG_COUNT,
          conversations: USER_COUNT * CONVERSATIONS_PER_USER,
          messages: USER_COUNT * CONVERSATIONS_PER_USER * MESSAGES_PER_CONVERSATION,
          idStrategy: "uuidv7",
        },
        null,
        2,
      )}\n`,
    );
    await close();
    return;
  }

  try {
    const oldSeedUsers = await db
      .select({ id: schemas.user.id })
      .from(schemas.user)
      .where(like(schemas.user.email, SEEDED_EMAIL_PATTERN));

    const oldSeedUserIds = oldSeedUsers.map((row) => row.id);

    if (oldSeedUserIds.length > 0) {
      await db.delete(schemas.embeddings).where(inArray(schemas.embeddings.userId, oldSeedUserIds));
      await db.delete(schemas.chunks).where(inArray(schemas.chunks.userId, oldSeedUserIds));

      await db
        .delete(schemas.aiProviderCredentials)
        .where(
          and(
            eq(schemas.aiProviderCredentials.ownerType, "user"),
            inArray(schemas.aiProviderCredentials.ownerId, oldSeedUserIds),
          ),
        );

      await db
        .delete(schemas.aiProfileBindings)
        .where(
          and(
            eq(schemas.aiProfileBindings.ownerType, "user"),
            inArray(schemas.aiProfileBindings.ownerId, oldSeedUserIds),
          ),
        );

      await db
        .delete(schemas.aiProfiles)
        .where(
          and(
            eq(schemas.aiProfiles.ownerType, "user"),
            inArray(schemas.aiProfiles.ownerId, oldSeedUserIds),
          ),
        );

      await db.delete(schemas.user).where(inArray(schemas.user.id, oldSeedUserIds));
    }

    await db.delete(schemas.resources).where(eq(schemas.resources.schemaName, "seed"));
    await db
      .delete(schemas.organization)
      .where(like(schemas.organization.slug, SEEDED_ORG_SLUG_PATTERN));

    const now = new Date();
    const users = Array.from({ length: USER_COUNT }, (_, idx) => {
      const number = idx + 1;
      const username = `${SEEDED_USERNAME_PREFIX}${pad3(number)}`;
      return {
        id: uuidv7(),
        name: `Seed User ${number}`,
        email: `${username}@raypx.local`,
        emailVerified: true,
        image: null,
        username,
        displayUsername: username,
        role: "user",
      };
    });

    await db.insert(schemas.user).values(users);

    const organizations = Array.from({ length: ORG_COUNT }, (_, idx) => {
      const number = idx + 1;
      return {
        id: uuidv7(),
        name: `Seed Organization ${number}`,
        slug: `seed-org-${pad3(number)}`,
        logo: null,
        metadata: JSON.stringify({ seeded: true }),
      };
    });

    await db.insert(schemas.organization).values(organizations);

    const members = users.map((userItem, idx) => {
      const org = organizations[idx % organizations.length];
      return {
        id: uuidv7(),
        organizationId: org.id,
        userId: userItem.id,
        role: idx < organizations.length ? "owner" : "member",
      };
    });

    await db.insert(schemas.member).values(members);

    const apiKeys = users.map((userItem, idx) => {
      const n = idx + 1;
      return {
        id: uuidv7(),
        name: `Seed API Key ${n}`,
        start: "seed",
        prefix: "rk_",
        key: `rk_seed_${uuidv7()}`,
        userId: userItem.id,
        enabled: true,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 86_400_000,
        rateLimitMax: 1000,
        requestCount: 0,
        remaining: 1000,
        permissions: "read,write",
        metadata: JSON.stringify({ seeded: true }),
      };
    });

    await db.insert(schemas.apikey).values(apiKeys);

    const sessions = users.slice(0, 60).map((userItem, idx) => {
      const n = idx + 1;
      return {
        id: uuidv7(),
        expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
        token: `seed-session-${pad3(n)}-${uuidv7()}`,
        lastActive: now,
        ipAddress: "127.0.0.1",
        userAgent: "raypx-seed",
        userId: userItem.id,
      };
    });

    await db.insert(schemas.session).values(sessions);

    const accounts = users.map((userItem, idx) => {
      const n = idx + 1;
      return {
        id: uuidv7(),
        accountId: `seed-account-${pad3(n)}`,
        providerId: "seed",
        userId: userItem.id,
        scope: "basic",
      };
    });

    await db.insert(schemas.account).values(accounts);

    const providers = users.map((userItem, idx) => ({
      id: uuidv7(),
      scope: "user" as const,
      userId: userItem.id,
      name: `Seed Provider ${idx + 1}`,
      driver: "openai",
      baseUrl: null,
      defaultModel: "gpt-4.1-mini",
      isEnabled: true,
      isDefault: true,
      metadata: { seeded: true },
    }));

    await db.insert(schemas.aiProviders).values(providers);

    const providerKeys = providers.map((provider) => ({
      id: uuidv7(),
      providerId: provider.id,
      apiKeyEncrypted: `enc_${uuidv7()}`,
      keyHint: "sk-***seed",
      status: "active",
      lastVerifiedAt: now,
    }));

    await db.insert(schemas.aiProviderKeys).values(providerKeys);

    const profileByUserId = new Map<string, string>();
    const profiles = users.map((userItem) => {
      const profileId = uuidv7();
      profileByUserId.set(userItem.id, profileId);
      return {
        id: profileId,
        scope: "user",
        ownerType: "user",
        ownerId: userItem.id,
        name: `Default Profile ${userItem.username}`,
        provider: "zhipu",
        model: "glm-5-flash",
        temperature: 0.7,
        maxTokens: 2048,
        isDefault: true,
        metadata: { seeded: true },
      };
    });

    await db.insert(schemas.aiProfiles).values(profiles);

    const profileBindings = users
      .map((userItem) => {
        const profileId = profileByUserId.get(userItem.id);
        if (!profileId) return null;
        return {
          id: uuidv7(),
          ownerType: "user" as const,
          ownerId: userItem.id,
          profileId,
          isActive: true,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    await db.insert(schemas.aiProfileBindings).values(profileBindings);

    const providerCredentials = users.map((userItem) => ({
      id: uuidv7(),
      ownerType: "user",
      ownerId: userItem.id,
      provider: "zhipu",
      apiKeyEncrypted: `enc_${uuidv7()}`,
      keyHint: "sk-***seed",
      status: "active",
      lastVerifiedAt: now,
    }));

    await db.insert(schemas.aiProviderCredentials).values(providerCredentials);

    const runtimePolicies = users.map((userItem) => ({
      id: uuidv7(),
      scope: "user",
      organizationId: null,
      userId: userItem.id,
      name: `Policy ${userItem.username}`,
      allowedProviders: ["openai", "zhipu"],
      allowedModels: ["gpt-4.1-mini", "glm-5-flash"],
      maxTokens: 4096,
      timeoutMs: 60_000,
      retryCount: 2,
      isActive: true,
      metadata: { seeded: true },
    }));

    await db.insert(schemas.aiRuntimePolicies).values(runtimePolicies);

    const conversations: Array<{
      id: string;
      userId: string;
      title: string;
      model: string;
      provider: string;
      providerId: string;
    }> = [];

    for (const userItem of users) {
      const userProvider = providers.find((p) => p.userId === userItem.id);
      if (!userProvider) continue;
      for (let i = 0; i < CONVERSATIONS_PER_USER; i += 1) {
        conversations.push({
          id: uuidv7(),
          userId: userItem.id,
          title: `${userItem.username} conversation ${i + 1}`,
          model: userProvider.defaultModel,
          provider: userProvider.driver,
          providerId: userProvider.id,
        });
      }
    }

    await db.insert(schemas.aiConversations).values(conversations);

    const messages = conversations.flatMap((conversationItem) =>
      Array.from({ length: MESSAGES_PER_CONVERSATION }, (_, idx) => ({
        id: uuidv7(),
        conversationId: conversationItem.id,
        role: idx % 2 === 0 ? "user" : "assistant",
        content:
          idx % 2 === 0
            ? `User prompt ${idx + 1} for ${conversationItem.title}`
            : `Assistant response ${idx + 1} for ${conversationItem.title}`,
        metadata: { seeded: true, turn: idx + 1 },
        tokens: 60 + idx * 20,
      })),
    );

    await db.insert(schemas.aiMessages).values(messages);

    const generations = users.map((userItem) => ({
      id: uuidv7(),
      userId: userItem.id,
      type: "content",
      prompt: `Generate weekly summary for ${userItem.username}`,
      result: `Generated summary for ${userItem.username}`,
      model: "gpt-4.1-mini",
      provider: "openai",
      tokens: 200,
      cached: false,
    }));

    await db.insert(schemas.aiGenerations).values(generations);

    const analyses = users.map((userItem) => ({
      id: uuidv7(),
      userId: userItem.id,
      dataType: "json",
      dataSource: "seed://sample",
      analysisType: "summary",
      results: { score: 0.9, seeded: true },
      model: "gpt-4.1-mini",
      tokens: 120,
      cached: false,
    }));

    await db.insert(schemas.aiAnalyses).values(analyses);

    const callLogs = users.slice(0, 80).map((userItem) => ({
      id: uuidv7(),
      traceId: uuidv7(),
      userId: userItem.id,
      route: "ai.chatStream",
      provider: "openai",
      model: "gpt-4.1-mini",
      inputTokens: 120,
      outputTokens: 260,
      totalTokens: 380,
      ttftMs: 350,
      chunkCount: 10,
      charCount: 800,
      latencyMs: 2200,
      status: "success",
      errorCode: null,
      requestId: `seed-req-${uuidv7()}`,
      costUsdCents: 3,
      metadata: { seeded: true },
      endedAt: now,
    }));

    await db.insert(schemas.aiCallLogs).values(callLogs);

    const providerByUserId = new Map<string, string>();
    for (const provider of providers) {
      providerByUserId.set(provider.userId, provider.id);
    }

    const auditLogs = users.map((userItem) => ({
      id: uuidv7(),
      userId: userItem.id,
      providerId: providerByUserId.get(userItem.id) ?? null,
      action: "create_provider",
      status: "success",
      details: { seeded: true },
    }));

    await db.insert(schemas.aiProviderAuditLogs).values(auditLogs);

    const subscribedUsers = users.slice(0, 30);
    const subscriptions = subscribedUsers.map((userItem, idx) => ({
      id: uuidv7(),
      organizationId: organizations[idx % organizations.length].id,
      userId: userItem.id,
      planId: "pro-monthly",
      status: "active" as const,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: `sub_seed_${pad3(idx + 1)}`,
      stripeCustomerId: `cus_seed_${pad3(idx + 1)}`,
    }));

    await db.insert(schemas.subscription).values(subscriptions);

    const invoices = subscriptions.map((subscriptionItem, idx) => ({
      id: uuidv7(),
      organizationId: subscriptionItem.organizationId,
      userId: subscriptionItem.userId,
      subscriptionId: subscriptionItem.id,
      amount: 2900,
      currency: "usd",
      status: "paid" as const,
      invoiceNumber: `INV-SEED-${(idx + 1).toString().padStart(5, "0")}`,
      invoiceDate: now,
      dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      paidAt: now,
      pdfUrl: null,
      stripeInvoiceId: `in_seed_${pad3(idx + 1)}`,
    }));

    await db.insert(schemas.invoice).values(invoices);

    const paymentMethods = subscribedUsers.map((userItem, idx) => ({
      id: uuidv7(),
      organizationId: organizations[idx % organizations.length].id,
      userId: userItem.id,
      type: "card" as const,
      isDefault: true,
      last4: `${(1000 + idx).toString().slice(-4)}`,
      brand: "visa",
      expMonth: 12,
      expYear: 2030,
      stripePaymentMethodId: `pm_seed_${pad3(idx + 1)}`,
    }));

    await db.insert(schemas.paymentMethod).values(paymentMethods);

    await db.insert(schemas.resources).values([
      {
        id: uuidv7(),
        displayName: "Seed Users",
        isVisible: true,
        ordering: 1,
        schemaName: "seed",
        tableName: "users",
      },
      {
        id: uuidv7(),
        displayName: "Seed Conversations",
        isVisible: true,
        ordering: 2,
        schemaName: "seed",
        tableName: "conversations",
      },
      {
        id: uuidv7(),
        displayName: "Seed Billing",
        isVisible: true,
        ordering: 3,
        schemaName: "seed",
        tableName: "billing",
      },
    ]);

    const chunks = users.slice(0, 30).flatMap((userItem, idx) =>
      Array.from({ length: 2 }, (_, chunkIndex) => ({
        id: uuidv7(),
        text: `Chunk ${chunkIndex + 1} for ${userItem.username}`,
        index: `seed-index-${(idx % 5) + 1}`,
        userId: userItem.id,
        metadata: { seeded: true, chunkIndex },
      })),
    );

    await db.insert(schemas.chunks).values(chunks);

    const embeddings = chunks.map((chunkItem) => ({
      id: uuidv7(),
      chunkId: chunkItem.id,
      content: chunkItem.text,
      metadata: { seeded: true },
      model: "text-embedding-3-small",
      userId: chunkItem.userId,
    }));

    await db.insert(schemas.embeddings).values(embeddings);

    process.stdout.write(
      `Seeded ${users.length} users and related data across auth, ai, billing, resources, and vector tables.\n`,
    );
  } finally {
    await close();
  }
}

run().catch((error) => {
  process.stderr.write("Failed to seed data.\n");
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);

  const errorWithCause = error as { cause?: unknown; stack?: string };
  if (errorWithCause.cause) {
    process.stderr.write(`Cause: ${JSON.stringify(errorWithCause.cause, null, 2)}\n`);
  }
  if (errorWithCause.stack) {
    process.stderr.write(`${errorWithCause.stack}\n`);
  }
  process.exit(1);
});
