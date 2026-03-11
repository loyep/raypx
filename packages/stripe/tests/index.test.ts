import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findFirstSubscriptionMock,
  findFirstPaymentMethodMock,
  updateSetMock,
  updateWhereMock,
  insertValuesMock,
  checkoutCreateMock,
  portalCreateMock,
  subscriptionRetrieveMock,
  updateMock,
  insertMock,
} = vi.hoisted(() => ({
  findFirstSubscriptionMock: vi.fn(),
  findFirstPaymentMethodMock: vi.fn(),
  updateSetMock: vi.fn(),
  updateWhereMock: vi.fn(),
  insertValuesMock: vi.fn(),
  checkoutCreateMock: vi.fn(),
  portalCreateMock: vi.fn(),
  subscriptionRetrieveMock: vi.fn(),
  updateMock: vi.fn(),
  insertMock: vi.fn(),
}));

updateSetMock.mockReturnValue({
  where: updateWhereMock,
});

updateMock.mockImplementation(() => ({
  set: updateSetMock,
}));

insertMock.mockImplementation(() => ({
  values: insertValuesMock,
}));

vi.mock("@raypx/database", () => ({
  db: {
    query: {
      subscription: {
        findFirst: findFirstSubscriptionMock,
      },
      paymentMethod: {
        findFirst: findFirstPaymentMethodMock,
      },
    },
    update: updateMock,
    insert: insertMock,
  },
  eq: vi.fn((field, value) => ({ field, value })),
}));

vi.mock("@raypx/database/schemas", () => ({
  invoice: { __table: "invoice" },
  paymentMethod: {
    __table: "paymentMethod",
    stripePaymentMethodId: "stripePaymentMethodId",
  },
  subscription: {
    __table: "subscription",
    userId: "userId",
    stripeCustomerId: "stripeCustomerId",
  },
}));

vi.mock("stripe", () => {
  return {
    default: class Stripe {
      checkout = {
        sessions: {
          create: checkoutCreateMock,
        },
      };

      billingPortal = {
        sessions: {
          create: portalCreateMock,
        },
      };

      subscriptions = {
        retrieve: subscriptionRetrieveMock,
      };

      constructor(
        public secretKey: string,
        public options: unknown,
      ) {}
    },
  };
});

import {
  createCheckoutSession,
  createPortalSession,
  getStripe,
  handleCheckoutCompleted,
  handleInvoicePaid,
  handlePaymentMethodAttached,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  Stripe,
} from "../src";

describe("stripe integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_PRIVATE_KEY", "sk_test_123");
  });

  it("creates a stripe client from env", () => {
    const stripe = getStripe();

    expect(stripe).toBeInstanceOf(Stripe);
  });

  it("creates checkout sessions for new and existing customers", async () => {
    findFirstSubscriptionMock.mockResolvedValueOnce(null).mockResolvedValueOnce({
      stripeCustomerId: "cus_existing",
    });
    checkoutCreateMock
      .mockResolvedValueOnce({ url: "https://checkout/new" })
      .mockResolvedValueOnce({ url: "https://checkout/existing" });

    await expect(
      createCheckoutSession({
        userId: "user_1",
        userEmail: "user@raypx.com",
        priceId: "price_basic",
      }),
    ).resolves.toEqual({ url: "https://checkout/new" });

    await expect(
      createCheckoutSession({
        userId: "user_1",
        userEmail: "user@raypx.com",
        priceId: "price_pro",
      }),
    ).resolves.toEqual({ url: "https://checkout/existing" });

    expect(checkoutCreateMock).toHaveBeenNthCalledWith(1, {
      customer_email: "user@raypx.com",
      mode: "subscription",
      line_items: [{ price: "price_basic", quantity: 1 }],
      success_url: "http://localhost:3000/billing/success",
      cancel_url: "http://localhost:3000/billing/cancel",
      metadata: { userId: "user_1" },
    });
    expect(checkoutCreateMock).toHaveBeenNthCalledWith(2, {
      customer: "cus_existing",
      mode: "subscription",
      line_items: [{ price: "price_pro", quantity: 1 }],
      success_url: "http://localhost:3000/billing/success",
      cancel_url: "http://localhost:3000/billing/cancel",
      metadata: { userId: "user_1" },
    });
  });

  it("creates portal sessions for subscribed customers", async () => {
    findFirstSubscriptionMock.mockResolvedValue({
      stripeCustomerId: "cus_123",
    });
    portalCreateMock.mockResolvedValue({
      url: "https://billing.raypx.com/portal",
    });

    await expect(createPortalSession({ userId: "user_1" })).resolves.toEqual({
      url: "https://billing.raypx.com/portal",
    });
    expect(portalCreateMock).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "http://localhost:3000/billing/success",
    });
  });

  it("persists webhook updates for subscriptions, invoices, and payment methods", async () => {
    findFirstSubscriptionMock
      .mockResolvedValueOnce({
        id: "sub_row_1",
        userId: "user_1",
      })
      .mockResolvedValueOnce({
        userId: "user_1",
        stripeCustomerId: "cus_123",
        planId: "price_old",
      })
      .mockResolvedValueOnce({
        id: "sub_row_1",
        userId: "user_1",
        stripeSubscriptionId: "sub_123",
      })
      .mockResolvedValueOnce({
        userId: "user_1",
      });
    findFirstPaymentMethodMock.mockResolvedValue(null);
    subscriptionRetrieveMock.mockResolvedValue({
      status: "active",
      current_period_start: 1_700_000_000,
      current_period_end: 1_700_086_400,
      cancel_at_period_end: false,
      canceled_at: null,
      items: {
        data: [{ price: { id: "price_new" } }],
      },
      customer: "cus_123",
    });

    await handleCheckoutCompleted({
      metadata: { userId: "user_1" },
      customer: "cus_123",
      subscription: "sub_123",
    } as any);
    await handleSubscriptionUpdated({
      customer: "cus_123",
      status: "past_due",
      current_period_start: 1_700_000_000,
      current_period_end: 1_700_086_400,
      cancel_at_period_end: true,
      canceled_at: 1_700_086_400,
      items: { data: [{ price: { id: "price_pro" } }] },
    } as any);
    await handleSubscriptionDeleted({
      customer: "cus_123",
    } as any);
    await handleInvoicePaid({
      id: "in_123",
      subscription: "sub_123",
      amount_paid: 2000,
      currency: "usd",
      number: "INV-123",
      invoice_pdf: "https://stripe.test/invoice.pdf",
    } as any);
    await handlePaymentMethodAttached({
      id: "pm_123",
      customer: "cus_123",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        exp_month: 3,
        exp_year: 2030,
      },
    } as any);

    expect(updateSetMock).toHaveBeenCalled();
    expect(insertValuesMock).toHaveBeenCalled();
  });
});
