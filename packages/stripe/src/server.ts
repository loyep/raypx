import { authEnv, createEnv } from "@raypx/config";
import { db, eq } from "@raypx/database";
import {
  invoice,
  type PaymentMethodType,
  paymentMethod,
  type SubscriptionStatus,
  subscription,
} from "@raypx/database/schemas";
import { BILLING_PATHS } from "@raypx/shared/config";
import Stripe from "stripe";
import { envs } from "./env";

export { Stripe };

function getDefaultBillingUrl(path: string): string {
  return new URL(path, createEnv(authEnv).SITE_URL).toString();
}

export function getStripe(): Stripe {
  const runtimeEnv = envs();
  if (!runtimeEnv.STRIPE_PRIVATE_KEY) {
    throw new Error("STRIPE_PRIVATE_KEY is not configured");
  }

  return new Stripe(runtimeEnv.STRIPE_PRIVATE_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

interface SubscriptionWithPeriod {
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  items: {
    data: Array<{
      price: { id: string };
    }>;
  };
  customer: string;
}

export async function createCheckoutSession(options: {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ url: string | null }> {
  const stripe = getStripe();
  const { userId, userEmail, priceId, successUrl, cancelUrl } = options;

  const existingSub = await db.query.subscription.findFirst({
    where: { userId },
  });

  if (existingSub?.stripeCustomerId) {
    const session = await stripe.checkout.sessions.create({
      customer: existingSub.stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? getDefaultBillingUrl(BILLING_PATHS.success),
      cancel_url: cancelUrl ?? getDefaultBillingUrl(BILLING_PATHS.cancel),
      metadata: { userId },
    });

    return { url: session.url };
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl ?? getDefaultBillingUrl(BILLING_PATHS.success),
    cancel_url: cancelUrl ?? getDefaultBillingUrl(BILLING_PATHS.cancel),
    metadata: { userId },
  });

  return { url: session.url };
}

export async function createPortalSession(options: {
  userId: string;
  returnUrl?: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const { userId, returnUrl } = options;

  const sub = await db.query.subscription.findFirst({
    where: { userId },
  });

  if (!sub?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl ?? getDefaultBillingUrl(BILLING_PATHS.success),
  });

  return { url: session.url };
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.error("Missing userId or subscriptionId in checkout session");
    return;
  }

  const stripe = getStripe();
  const stripeSubscription = (await stripe.subscriptions.retrieve(
    subscriptionId,
  )) as unknown as SubscriptionWithPeriod;

  const existingSub = await db.query.subscription.findFirst({
    where: { userId },
  });

  if (existingSub) {
    await db
      .update(subscription)
      .set({
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: stripeSubscription.status as SubscriptionStatus,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        planId: stripeSubscription.items.data[0]?.price.id ?? "",
      })
      .where(eq(subscription.userId, userId));
  } else {
    await db.insert(subscription).values({
      userId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: stripeSubscription.status as SubscriptionStatus,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      planId: stripeSubscription.items.data[0]?.price.id ?? "",
    });
  }
}

export async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const sub = stripeSub as unknown as SubscriptionWithPeriod;
  const customerId = sub.customer as string;

  const existingSub = await db.query.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSub) return;

  await db
    .update(subscription)
    .set({
      status: sub.status as SubscriptionStatus,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      planId: sub.items.data[0]?.price.id ?? existingSub.planId,
    })
    .where(eq(subscription.stripeCustomerId, customerId));
}

export async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const customerId = stripeSub.customer as string;

  await db
    .update(subscription)
    .set({
      status: "canceled",
      canceledAt: new Date(),
    })
    .where(eq(subscription.stripeCustomerId, customerId));
}

export async function handleInvoicePaid(stripeInv: Stripe.Invoice) {
  const subscriptionId = (stripeInv as Stripe.Invoice & { subscription: string }).subscription;

  if (!subscriptionId) return;

  const existingSub = await db.query.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existingSub) return;

  await db.insert(invoice).values({
    userId: existingSub.userId,
    subscriptionId: existingSub.id,
    amount: stripeInv.amount_paid,
    currency: stripeInv.currency,
    status: "paid",
    invoiceNumber: stripeInv.number ?? `INV-${Date.now()}`,
    invoiceDate: new Date(),
    paidAt: new Date(),
    pdfUrl: stripeInv.invoice_pdf ?? undefined,
    stripeInvoiceId: stripeInv.id,
  });
}

export async function handlePaymentMethodAttached(pm: Stripe.PaymentMethod) {
  const customerId = pm.customer as string;

  const existingSub = await db.query.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSub?.userId) return;

  const existingPm = await db.query.paymentMethod.findFirst({
    where: { stripePaymentMethodId: pm.id },
  });

  if (existingPm) return;

  const isDefault = pm.card?.brand !== undefined;
  const paymentType =
    pm.type === "card"
      ? "card"
      : pm.type === "us_bank_account"
        ? "bank_account"
        : pm.type === "paypal"
          ? "paypal"
          : "card";

  await db.insert(paymentMethod).values({
    userId: existingSub.userId,
    type: paymentType as PaymentMethodType,
    isDefault,
    last4: pm.card?.last4,
    brand: pm.card?.brand,
    expMonth: pm.card?.exp_month,
    expYear: pm.card?.exp_year,
    stripePaymentMethodId: pm.id,
  });
}
