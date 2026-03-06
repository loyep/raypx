import type { DatabaseClient } from "@raypx/database";
import { and, desc, eq, inArray } from "@raypx/database";
import {
  aiProfileBindings,
  aiProfiles,
  aiProviderAuditLogs,
  aiProviderKeys,
  aiProviders,
} from "@raypx/database/schemas";
import type {
  AICreateUserProviderInput,
  AIListProviderAuditLogsInput,
  AIProviderAuditLogItem,
  AIProviderDriver,
  AIUpdateUserChatPreferencesInput,
  AIUpdateUserProviderInput,
} from "../types";

export async function getUserBoundProfile(db: DatabaseClient, input: { userId: string }) {
  const [row] = await db
    .select()
    .from(aiProfileBindings)
    .innerJoin(aiProfiles, eq(aiProfiles.id, aiProfileBindings.profileId))
    .where(
      and(
        eq(aiProfileBindings.ownerType, "user"),
        eq(aiProfileBindings.ownerId, input.userId),
        eq(aiProfileBindings.isActive, true),
      ),
    )
    .orderBy(desc(aiProfileBindings.updatedAt))
    .limit(1);

  if (!row) {
    return null;
  }

  return { binding: row.ai_profile_bindings, profile: row.ai_profiles };
}

export async function upsertUserProfile(
  db: DatabaseClient,
  input: {
    userId: string;
    data: AIUpdateUserChatPreferencesInput & {
      model: string;
      temperature: number;
      maxTokens: number;
      defaultProviderId: string | null;
    };
  },
) {
  const bound = await getUserBoundProfile(db, { userId: input.userId });

  if (!bound) {
    const [profile] = await db
      .insert(aiProfiles)
      .values({
        scope: "user",
        ownerType: "user",
        ownerId: input.userId,
        name: "My Chat Profile",
        provider: "dynamic",
        providerId: input.data.defaultProviderId,
        model: input.data.model,
        temperature: input.data.temperature,
        maxTokens: input.data.maxTokens,
        isDefault: true,
        metadata: {
          createdBy: "settings",
        },
      })
      .returning();

    if (!profile) {
      throw new Error("Failed to create AI profile");
    }

    await db
      .update(aiProfileBindings)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(eq(aiProfileBindings.ownerType, "user"), eq(aiProfileBindings.ownerId, input.userId)),
      );

    await db.insert(aiProfileBindings).values({
      ownerType: "user",
      ownerId: input.userId,
      profileId: profile.id,
      isActive: true,
    });

    return profile;
  }

  const [updated] = await db
    .update(aiProfiles)
    .set({
      provider: "dynamic",
      providerId: input.data.defaultProviderId,
      model: input.data.model,
      temperature: input.data.temperature,
      maxTokens: input.data.maxTokens,
      updatedAt: new Date(),
    })
    .where(eq(aiProfiles.id, bound.profile.id))
    .returning();

  if (!updated) {
    throw new Error("Failed to update AI profile");
  }

  return updated;
}

export async function setUserProfileMetadata(
  db: DatabaseClient,
  input: {
    userId: string;
    metadata: Record<string, unknown>;
  },
) {
  const bound = await getUserBoundProfile(db, { userId: input.userId });
  if (!bound) {
    return null;
  }

  const currentMetadata =
    bound.profile.metadata && typeof bound.profile.metadata === "object"
      ? (bound.profile.metadata as Record<string, unknown>)
      : {};

  const [updated] = await db
    .update(aiProfiles)
    .set({
      metadata: {
        ...currentMetadata,
        ...input.metadata,
      },
      updatedAt: new Date(),
    })
    .where(eq(aiProfiles.id, bound.profile.id))
    .returning();

  return updated ?? null;
}

export async function listUserProviders(db: DatabaseClient, input: { userId: string }) {
  return db
    .select()
    .from(aiProviders)
    .where(and(eq(aiProviders.scope, "user"), eq(aiProviders.userId, input.userId)))
    .orderBy(desc(aiProviders.updatedAt));
}

export async function listSystemProviders(db: DatabaseClient) {
  return db
    .select()
    .from(aiProviders)
    .where(eq(aiProviders.scope, "system"))
    .orderBy(desc(aiProviders.updatedAt));
}

export async function getSystemProviderById(db: DatabaseClient, input: { providerId: string }) {
  const [row] = await db
    .select()
    .from(aiProviders)
    .where(and(eq(aiProviders.id, input.providerId), eq(aiProviders.scope, "system")))
    .limit(1);

  return row ?? null;
}

export async function getDefaultSystemProvider(db: DatabaseClient) {
  const [row] = await db
    .select()
    .from(aiProviders)
    .where(and(eq(aiProviders.scope, "system"), eq(aiProviders.isDefault, true)))
    .limit(1);

  return row ?? null;
}

export async function createSystemProvider(db: DatabaseClient, input: AICreateUserProviderInput) {
  if (input.setDefault) {
    await db
      .update(aiProviders)
      .set({
        isDefault: false,
        updatedAt: new Date(),
      })
      .where(eq(aiProviders.scope, "system"));
  }

  const [created] = await db
    .insert(aiProviders)
    .values({
      scope: "system",
      userId: null,
      name: input.name,
      driver: input.driver,
      baseUrl: input.baseUrl ?? null,
      defaultModel: input.defaultModel,
      isEnabled: input.isEnabled ?? true,
      isDefault: input.setDefault ?? false,
      metadata: input.metadata ?? null,
    })
    .returning();

  return created ?? null;
}

export async function updateSystemProvider(db: DatabaseClient, input: AIUpdateUserProviderInput) {
  const current = await getSystemProviderById(db, {
    providerId: input.providerId,
  });
  if (!current) {
    return null;
  }

  const [updated] = await db
    .update(aiProviders)
    .set({
      name: input.name ?? current.name,
      driver: (input.driver ?? current.driver) as AIProviderDriver,
      baseUrl: input.baseUrl === undefined ? current.baseUrl : input.baseUrl,
      defaultModel: input.defaultModel ?? current.defaultModel,
      isEnabled: input.isEnabled ?? current.isEnabled,
      metadata: input.metadata === undefined ? current.metadata : input.metadata,
      updatedAt: new Date(),
    })
    .where(and(eq(aiProviders.id, current.id), eq(aiProviders.scope, "system")))
    .returning();

  return updated ?? null;
}

export async function setDefaultSystemProvider(db: DatabaseClient, input: { providerId: string }) {
  const target = await getSystemProviderById(db, input);
  if (!target) {
    return null;
  }

  await db
    .update(aiProviders)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(eq(aiProviders.scope, "system"));

  const [updated] = await db
    .update(aiProviders)
    .set({
      isDefault: true,
      updatedAt: new Date(),
    })
    .where(and(eq(aiProviders.id, input.providerId), eq(aiProviders.scope, "system")))
    .returning();

  return updated ?? null;
}

export async function deleteSystemProvider(db: DatabaseClient, input: { providerId: string }) {
  const current = await getSystemProviderById(db, input);
  if (!current) {
    return null;
  }

  const [deleted] = await db
    .delete(aiProviders)
    .where(and(eq(aiProviders.id, current.id), eq(aiProviders.scope, "system")))
    .returning();

  if (current.isDefault) {
    const [next] = await db
      .select()
      .from(aiProviders)
      .where(and(eq(aiProviders.scope, "system"), eq(aiProviders.isEnabled, true)))
      .limit(1);

    if (next) {
      await setDefaultSystemProvider(db, { providerId: next.id });
    }
  }

  return deleted ?? null;
}

export async function getUserProviderById(
  db: DatabaseClient,
  input: { userId: string; providerId: string },
) {
  const [row] = await db
    .select()
    .from(aiProviders)
    .where(
      and(
        eq(aiProviders.id, input.providerId),
        eq(aiProviders.scope, "user"),
        eq(aiProviders.userId, input.userId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getDefaultUserProvider(db: DatabaseClient, input: { userId: string }) {
  const [row] = await db
    .select()
    .from(aiProviders)
    .where(
      and(
        eq(aiProviders.scope, "user"),
        eq(aiProviders.userId, input.userId),
        eq(aiProviders.isDefault, true),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function createUserProvider(
  db: DatabaseClient,
  input: { userId: string } & AICreateUserProviderInput,
) {
  if (input.setDefault) {
    await db
      .update(aiProviders)
      .set({
        isDefault: false,
        updatedAt: new Date(),
      })
      .where(and(eq(aiProviders.scope, "user"), eq(aiProviders.userId, input.userId)));
  }

  const [created] = await db
    .insert(aiProviders)
    .values({
      scope: "user",
      userId: input.userId,
      name: input.name,
      driver: input.driver,
      baseUrl: input.baseUrl ?? null,
      defaultModel: input.defaultModel,
      isEnabled: input.isEnabled ?? true,
      isDefault: input.setDefault ?? false,
      metadata: input.metadata ?? null,
    })
    .returning();

  return created ?? null;
}

export async function updateUserProvider(
  db: DatabaseClient,
  input: { userId: string } & AIUpdateUserProviderInput,
) {
  const current = await getUserProviderById(db, {
    userId: input.userId,
    providerId: input.providerId,
  });
  if (!current) {
    return null;
  }

  const [updated] = await db
    .update(aiProviders)
    .set({
      name: input.name ?? current.name,
      driver: (input.driver ?? current.driver) as AIProviderDriver,
      baseUrl: input.baseUrl === undefined ? current.baseUrl : input.baseUrl,
      defaultModel: input.defaultModel ?? current.defaultModel,
      isEnabled: input.isEnabled ?? current.isEnabled,
      metadata: input.metadata === undefined ? current.metadata : input.metadata,
      updatedAt: new Date(),
    })
    .where(eq(aiProviders.id, current.id))
    .returning();

  return updated ?? null;
}

export async function setDefaultUserProvider(
  db: DatabaseClient,
  input: { userId: string; providerId: string },
) {
  const target = await getUserProviderById(db, input);
  if (!target) {
    return null;
  }

  await db
    .update(aiProviders)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(and(eq(aiProviders.scope, "user"), eq(aiProviders.userId, input.userId)));

  const [updated] = await db
    .update(aiProviders)
    .set({
      isDefault: true,
      updatedAt: new Date(),
    })
    .where(eq(aiProviders.id, input.providerId))
    .returning();

  return updated ?? null;
}

export async function deleteUserProvider(
  db: DatabaseClient,
  input: { userId: string; providerId: string },
) {
  const current = await getUserProviderById(db, input);
  if (!current) {
    return null;
  }

  const [deleted] = await db.delete(aiProviders).where(eq(aiProviders.id, current.id)).returning();

  if (current.isDefault) {
    const [next] = await db
      .select()
      .from(aiProviders)
      .where(
        and(
          eq(aiProviders.scope, "user"),
          eq(aiProviders.userId, input.userId),
          eq(aiProviders.isEnabled, true),
        ),
      )
      .limit(1);

    if (next) {
      await setDefaultUserProvider(db, { userId: input.userId, providerId: next.id });
    }
  }

  return deleted ?? null;
}

export async function listUserProviderCredentialsByProviderIds(
  db: DatabaseClient,
  input: {
    providerIds: string[];
  },
) {
  if (input.providerIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(aiProviderKeys)
    .where(inArray(aiProviderKeys.providerId, input.providerIds));
}

export async function listSystemProviderCredentialsByProviderIds(
  db: DatabaseClient,
  input: {
    providerIds: string[];
  },
) {
  if (input.providerIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(aiProviderKeys)
    .where(inArray(aiProviderKeys.providerId, input.providerIds));
}

export async function getUserProviderCredential(
  db: DatabaseClient,
  input: { userId: string; providerId: string },
) {
  const provider = await getUserProviderById(db, {
    userId: input.userId,
    providerId: input.providerId,
  });
  if (!provider) {
    return null;
  }

  const [row] = await db
    .select()
    .from(aiProviderKeys)
    .where(
      and(eq(aiProviderKeys.providerId, input.providerId), eq(aiProviderKeys.status, "active")),
    )
    .limit(1);

  return row ?? null;
}

export async function getSystemProviderCredential(
  db: DatabaseClient,
  input: { providerId: string },
) {
  const provider = await getSystemProviderById(db, {
    providerId: input.providerId,
  });
  if (!provider) {
    return null;
  }

  const [row] = await db
    .select()
    .from(aiProviderKeys)
    .where(
      and(eq(aiProviderKeys.providerId, input.providerId), eq(aiProviderKeys.status, "active")),
    )
    .limit(1);

  return row ?? null;
}

export async function setUserProviderSecret(
  db: DatabaseClient,
  input: {
    userId: string;
    providerId: string;
    apiKeyEncrypted: string;
    keyHint: string;
  },
) {
  const provider = await getUserProviderById(db, {
    userId: input.userId,
    providerId: input.providerId,
  });
  if (!provider) {
    return null;
  }

  const [existing] = await db
    .select()
    .from(aiProviderKeys)
    .where(eq(aiProviderKeys.providerId, input.providerId))
    .limit(1);

  if (!existing) {
    const [created] = await db
      .insert(aiProviderKeys)
      .values({
        providerId: input.providerId,
        apiKeyEncrypted: input.apiKeyEncrypted,
        keyHint: input.keyHint,
        status: "active",
      })
      .returning();

    return created ?? null;
  }

  const [updated] = await db
    .update(aiProviderKeys)
    .set({
      apiKeyEncrypted: input.apiKeyEncrypted,
      keyHint: input.keyHint,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(aiProviderKeys.id, existing.id))
    .returning();

  return updated ?? null;
}

export async function setSystemProviderSecret(
  db: DatabaseClient,
  input: {
    providerId: string;
    apiKeyEncrypted: string;
    keyHint: string;
  },
) {
  const provider = await getSystemProviderById(db, {
    providerId: input.providerId,
  });
  if (!provider) {
    return null;
  }

  const [existing] = await db
    .select()
    .from(aiProviderKeys)
    .where(eq(aiProviderKeys.providerId, input.providerId))
    .limit(1);

  if (!existing) {
    const [created] = await db
      .insert(aiProviderKeys)
      .values({
        providerId: input.providerId,
        apiKeyEncrypted: input.apiKeyEncrypted,
        keyHint: input.keyHint,
        status: "active",
      })
      .returning();

    return created ?? null;
  }

  const [updated] = await db
    .update(aiProviderKeys)
    .set({
      apiKeyEncrypted: input.apiKeyEncrypted,
      keyHint: input.keyHint,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(aiProviderKeys.id, existing.id))
    .returning();

  return updated ?? null;
}

export async function removeUserProviderSecret(
  db: DatabaseClient,
  input: { userId: string; providerId: string },
) {
  const provider = await getUserProviderById(db, {
    userId: input.userId,
    providerId: input.providerId,
  });
  if (!provider) {
    return null;
  }

  const [updated] = await db
    .update(aiProviderKeys)
    .set({
      status: "revoked",
      updatedAt: new Date(),
    })
    .where(eq(aiProviderKeys.providerId, input.providerId))
    .returning();

  return updated ?? null;
}

export async function removeSystemProviderSecret(
  db: DatabaseClient,
  input: { providerId: string },
) {
  const provider = await getSystemProviderById(db, {
    providerId: input.providerId,
  });
  if (!provider) {
    return null;
  }

  const [updated] = await db
    .update(aiProviderKeys)
    .set({
      status: "revoked",
      updatedAt: new Date(),
    })
    .where(eq(aiProviderKeys.providerId, input.providerId))
    .returning();

  return updated ?? null;
}

export async function appendProviderAuditLog(
  db: DatabaseClient,
  input: {
    userId: string;
    providerId?: string | null;
    action:
      | "provider.create"
      | "provider.update"
      | "provider.delete"
      | "provider.set_default"
      | "provider.enable"
      | "provider.disable"
      | "provider.credential.upsert"
      | "provider.credential.remove";
    status?: "success" | "failed";
    details?: Record<string, unknown> | null;
  },
) {
  await db.insert(aiProviderAuditLogs).values({
    userId: input.userId,
    providerId: input.providerId ?? null,
    action: input.action,
    status: input.status ?? "success",
    details: input.details ?? null,
  });
}

export async function listUserProviderAuditLogs(
  db: DatabaseClient,
  input: {
    userId: string;
  } & AIListProviderAuditLogsInput,
): Promise<{ items: AIProviderAuditLogItem[] }> {
  let rows = await db
    .select()
    .from(aiProviderAuditLogs)
    .where(eq(aiProviderAuditLogs.userId, input.userId))
    .orderBy(desc(aiProviderAuditLogs.createdAt))
    .limit(input.limit)
    .offset(input.offset);

  if (input.action?.trim()) {
    rows = rows.filter((row) => row.action === input.action);
  }

  const providerIds = rows.map((row) => row.providerId).filter((id): id is string => Boolean(id));

  const providers =
    providerIds.length > 0
      ? await db.select().from(aiProviders).where(inArray(aiProviders.id, providerIds))
      : [];

  const providerMap = new Map(providers.map((provider) => [provider.id, provider.name]));

  return {
    items: rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      providerId: row.providerId,
      providerName: row.providerId ? (providerMap.get(row.providerId) ?? null) : null,
      action: row.action,
      status: row.status as "success" | "failed",
      details: (row.details as Record<string, unknown> | null) ?? null,
      createdAt: row.createdAt,
    })),
  };
}
