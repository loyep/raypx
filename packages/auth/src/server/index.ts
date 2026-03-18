import { db, eq, uuidv7 } from "@raypx/database";
import * as schema from "@raypx/database/schemas";
import { isEmailConfigured, sendEmail } from "@raypx/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  bearer,
  emailOTP,
  jwt,
  lastLoginMethod,
  multiSession,
  organization,
  username,
} from "better-auth/plugins";
import { defaultRoles } from "better-auth/plugins/admin/access";

import { env } from "../envs";
import type { AuthConfig, SessionWithExtendedUser } from "../types";

const DEFAULT_ORG_NAME = "Default Workspace";

/**
 * Default session expiration (7 days in seconds)
 */
const DEFAULT_SESSION_EXPIRES_IN = 60 * 60 * 24 * 7;

function resolveProviders(
  providers: AuthConfig["providers"],
): NonNullable<AuthConfig["providers"]> {
  if (providers !== undefined) {
    return providers;
  }

  const enabled: NonNullable<AuthConfig["providers"]> = [];
  if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) enabled.push("google");
  if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) enabled.push("github");
  if (env.AUTH_APPLE_ID && env.AUTH_APPLE_SECRET) enabled.push("apple");
  if (env.AUTH_MICROSOFT_ID && env.AUTH_MICROSOFT_SECRET) enabled.push("microsoft");
  if (env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET) enabled.push("discord");
  if (env.AUTH_TWITTER_ID && env.AUTH_TWITTER_SECRET) enabled.push("twitter");
  if (env.AUTH_FACEBOOK_ID && env.AUTH_FACEBOOK_SECRET) enabled.push("facebook");

  return enabled;
}

/**
 * Create a Better Auth instance configured for the server
 */
export function createAuth(config: AuthConfig = {}) {
  const resolvedSecret = env.AUTH_SECRET?.trim() || env.APP_KEY?.trim();
  const {
    baseURL = env.AUTH_URL,
    secret = resolvedSecret,
    providers = resolveProviders(config.providers),
    enableCredentials = true,
    enablePasskeys = false,
    enable2FA = false,
    requireEmailVerification = true,
    sessionExpiresIn = DEFAULT_SESSION_EXPIRES_IN,
  } = config;

  // Configure cookie domain for cross-subdomain auth
  // In production, set AUTH_DOMAIN to share cookies across subdomains (e.g., ".yourdomain.com")
  const cookieDomain = env.AUTH_DOMAIN;

  const auth = betterAuth({
    baseURL,
    secret,
    advanced: {
      database: {
        generateId: (): string => uuidv7(),
      },
      cookie: {
        domain: cookieDomain,
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const slug = `org-${uuidv7().replace(/-/g, "").slice(0, 12)}`;
            await auth.api.createOrganization({
              body: {
                userId: user.id,
                name: user.name ? `${user.name}'s Workspace` : DEFAULT_ORG_NAME,
                slug,
              },
            });
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const firstMember = await db.query.member.findFirst({
              where: { userId: session.userId },
              columns: { organizationId: true },
            });
            return {
              data: {
                ...session,
                activeOrganizationId: firstMember?.organizationId ?? undefined,
              },
            };
          },
        },
      },
    },
    session: {
      expiresIn: sessionExpiresIn,
      updateAge: 60 * 60 * 24, // Update session once per day
      freshAge: 0, // Allow OAuth users to delete with simple confirmation (no email)
    },
    emailAndPassword: {
      enabled: enableCredentials,
      requireEmailVerification: Boolean(requireEmailVerification && isEmailConfigured()),
    },
    passkey: {
      enabled: enablePasskeys,
    },
    twoFactor: {
      enabled: enable2FA,
    },
    user: {
      deleteUser: { enabled: true },
    },
    plugins: [
      ...(requireEmailVerification && isEmailConfigured()
        ? [
            emailOTP({
              overrideDefaultEmailVerification: true,
              sendVerificationOnSignUp: true,
              otpLength: 6,
              expiresIn: 300, // 5 minutes
              async sendVerificationOTP({ email, otp, type }) {
                if (type !== "email-verification") return;
                void sendEmail({
                  to: { email },
                  subject: "Verify your email address",
                  text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
                });
              },
            }),
          ]
        : []),
      organization(),
      admin({
        defaultRole: "user",
        adminRoles: ["admin", "superadmin"],
        roles: {
          user: defaultRoles.user,
          admin: defaultRoles.admin,
          superadmin: defaultRoles.admin,
        },
      }),
      username(),
      jwt(),
      multiSession(),
      bearer(),
      lastLoginMethod(),
    ],
    socialProviders: {
      google: providers.includes("google")
        ? {
            clientId: env.AUTH_GOOGLE_ID ?? "",
            clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
          }
        : undefined,
      github: providers.includes("github")
        ? {
            clientId: env.AUTH_GITHUB_ID ?? "",
            clientSecret: env.AUTH_GITHUB_SECRET ?? "",
          }
        : undefined,
      apple: providers.includes("apple")
        ? {
            clientId: env.AUTH_APPLE_ID ?? "",
            clientSecret: env.AUTH_APPLE_SECRET ?? "",
          }
        : undefined,
      microsoft: providers.includes("microsoft")
        ? {
            clientId: env.AUTH_MICROSOFT_ID ?? "",
            clientSecret: env.AUTH_MICROSOFT_SECRET ?? "",
          }
        : undefined,
      discord: providers.includes("discord")
        ? {
            clientId: env.AUTH_DISCORD_ID ?? "",
            clientSecret: env.AUTH_DISCORD_SECRET ?? "",
          }
        : undefined,
      twitter: providers.includes("twitter")
        ? {
            clientId: env.AUTH_TWITTER_ID ?? "",
            clientSecret: env.AUTH_TWITTER_SECRET ?? "",
          }
        : undefined,
      facebook: providers.includes("facebook")
        ? {
            clientId: env.AUTH_FACEBOOK_ID ?? "",
            clientSecret: env.AUTH_FACEBOOK_SECRET ?? "",
          }
        : undefined,
    },
  });

  return auth;
}

/**
 * Session payload returned by Better Auth
 */
export type ServerSession = Awaited<ReturnType<Auth["api"]["getSession"]>>;

/**
 * Session result with extended fields (role, activeOrganizationId).
 * Inferred from getServerSession return type.
 */
export type GetSessionResult = SessionWithExtendedUser | null;

/**
 * Framework-agnostic auth helpers
 */
function createServerAuthHelpers(config: AuthConfig = {}) {
  const auth = createAuth(config);

  async function getSession(headers: Headers): Promise<GetSessionResult> {
    const session = await auth.api.getSession({ headers });
    return session as GetSessionResult;
  }

  async function hasSession(headers: Headers): Promise<boolean> {
    const session = await getSession(headers);
    return Boolean(session?.session);
  }

  return {
    auth,
    getSession,
    hasSession,
  };
}

const defaultServerAuthHelpers = createServerAuthHelpers();

export const serverAuth = defaultServerAuthHelpers.auth;

export const getServerSession = defaultServerAuthHelpers.getSession;

export const hasServerSession = defaultServerAuthHelpers.hasSession;

export async function hasCredentialPasswordAccount(headers: Headers): Promise<boolean> {
  const session = await getServerSession(headers);
  if (!session?.user?.id) return false;

  const accounts = await db
    .select({ providerId: schema.account.providerId })
    .from(schema.account)
    .where(eq(schema.account.userId, session.user.id));

  return accounts.some((item) => item.providerId === "credential");
}

/**
 * Get session from request headers
 */
export async function getSessionFromRequest(auth: ReturnType<typeof createAuth>, request: Request) {
  try {
    const headers = request.headers;
    if (!headers) {
      return null;
    }
    const session = await auth.api.getSession({ headers });
    return session;
  } catch {
    return null;
  }
}

/**
 * Type export for the auth instance
 */
export type Auth = ReturnType<typeof createAuth>;

/**
 * Handlers for TanStack Start api/auth route.
 * Use with createFileRoute("/api/auth/$").
 *
 * @example
 * ```ts
 * import { createAuthRouteHandlers } from "@raypx/auth";
 * import { createFileRoute } from "@tanstack/react-router";
 *
 * export const Route = createFileRoute("/api/auth/$")({
 *   server: {
 *     handlers: createAuthRouteHandlers(),
 *   },
 * });
 * ```
 */
export function createAuthRouteHandlers() {
  return {
    GET: async ({ request }: { request: Request }) => serverAuth.handler(request),
    POST: async ({ request }: { request: Request }) => serverAuth.handler(request),
  };
}
