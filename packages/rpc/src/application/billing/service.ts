import { createCheckoutSession, createPortalSession } from "@raypx/stripe";

export const billingService = {
  async getSubscription(context: { db: any; user: { id: string } }) {
    const result = await context.db.query.subscription.findFirst({
      where: { userId: context.user.id },
    });

    return result ?? null;
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
    return context.db.query.invoice.findMany({
      where: { userId: context.user.id },
      orderBy: (invoice: any, { desc }: { desc: (value: unknown) => unknown[] }) => [
        desc(invoice.createdAt),
      ],
    });
  },
};
