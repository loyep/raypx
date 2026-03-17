import { and, eq, gte } from "@raypx/database";
import { aiCallLogs, aiProviders, type subscription, usageCounters } from "@raypx/database/schemas";
import { createCheckoutSession, createPortalSession } from "@raypx/stripe";

const BILLING_PLANS = [
  {
    id: "free",
    name: "Free",
    priceMonthlyUsd: 0,
    sourceModes: ["byok"] as const,
    features: ["Personal workspace", "Bring your own key", "Basic search scaffolding"],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 20,
    sourceModes: ["byok", "hosted"] as const,
    features: ["Hosted key pool", "Higher search allowance", "Workspace files and projects"],
  },
] as const;

function getCurrentPeriodWindow(
  subscriptionRecord: {
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  } | null,
) {
  const now = new Date();
  const periodStart =
    subscriptionRecord?.currentPeriodStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd =
    subscriptionRecord?.currentPeriodEnd ?? new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { periodStart, periodEnd };
}

export const billingService = {
  async getPlans() {
    return {
      success: true as const,
      data: {
        plans: BILLING_PLANS,
      },
    };
  },

  async getSubscription(context: { db: any; user: { id: string } }) {
    const result = await context.db.query.subscription.findFirst({
      where: { userId: context.user.id },
    });

    return {
      success: true as const,
      data: result ?? null,
    };
  },

  async getUsage(context: { db: any; user: { id: string } }) {
    const activeSubscription = await context.db.query.subscription.findFirst({
      where: {
        userId: context.user.id,
      },
      orderBy: (table: typeof subscription, helpers: { desc: (value: unknown) => unknown[] }) => [
        helpers.desc(table.updatedAt),
      ],
    });
    const { periodStart, periodEnd } = getCurrentPeriodWindow(activeSubscription ?? null);

    const [callLogs, counters] = await Promise.all([
      context.db
        .select()
        .from(aiCallLogs)
        .where(and(eq(aiCallLogs.userId, context.user.id), gte(aiCallLogs.createdAt, periodStart))),
      context.db
        .select()
        .from(usageCounters)
        .where(
          and(eq(usageCounters.userId, context.user.id), gte(usageCounters.periodEnd, periodStart)),
        ),
    ]);

    const totals = callLogs.reduce(
      (acc: { calls: number; totalTokens: number; totalCostUsdCents: number }, item: any) => ({
        calls: acc.calls + 1,
        totalTokens: acc.totalTokens + (item.totalTokens ?? 0),
        totalCostUsdCents: acc.totalCostUsdCents + (item.costUsdCents ?? 0),
      }),
      { calls: 0, totalTokens: 0, totalCostUsdCents: 0 },
    );

    return {
      success: true as const,
      data: {
        periodStart,
        periodEnd,
        calls: totals.calls,
        totalTokens: totals.totalTokens,
        totalCostUsdCents: totals.totalCostUsdCents,
        counters,
      },
    };
  },

  async getEntitlements(context: { db: any; user: { id: string } }) {
    const [activeSubscription, userProviders] = await Promise.all([
      context.db.query.subscription.findFirst({
        where: { userId: context.user.id },
      }),
      context.db
        .select()
        .from(aiProviders)
        .where(and(eq(aiProviders.userId, context.user.id), eq(aiProviders.scope, "user"))),
    ]);

    const hasHostedPlan =
      activeSubscription?.status === "active" || activeSubscription?.status === "trialing";

    return {
      success: true as const,
      data: {
        planId: hasHostedPlan ? "pro" : "free",
        sourceModes: hasHostedPlan ? ["byok", "hosted"] : ["byok"],
        canUseHostedPool: hasHostedPlan,
        canUseByok: userProviders.length > 0 || !hasHostedPlan,
        searchQuotaMonthly: hasHostedPlan ? 1000 : 100,
        fileQuotaMonthly: hasHostedPlan ? 500 : 25,
      },
    };
  },

  async createCheckout(
    context: { user: { id: string; email: string } },
    input: { priceId: string; successUrl?: string; cancelUrl?: string },
  ) {
    return createCheckoutSession({
      userId: context.user.id,
      userEmail: context.user.email,
      priceId: input.priceId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  },

  async createPortalSession(context: { user: { id: string } }, input: { returnUrl?: string }) {
    return createPortalSession({
      userId: context.user.id,
      returnUrl: input.returnUrl,
    });
  },

  async getPaymentMethods(context: { db: any; user: { id: string } }) {
    return context.db.query.paymentMethod.findMany({
      where: { userId: context.user.id },
    });
  },

  async getInvoices(context: { db: any; user: { id: string } }) {
    const invoices = await context.db.query.invoice.findMany({
      where: { userId: context.user.id },
      orderBy: (invoice: any, { desc }: { desc: (value: unknown) => unknown[] }) => [
        desc(invoice.createdAt),
      ],
    });

    return {
      success: true as const,
      data: invoices,
    };
  },
};
