import { sql } from "drizzle-orm";
import { boolean, check, index, integer, text, uuid } from "drizzle-orm/pg-core";
import { pgTable, timestamptz, uuidv7 } from "../../utils";
import { user } from "./auth";
import { organization } from "./organizations";

// Subscription status enum
export const subscriptionStatus = [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatus)[number];

// Invoice status enum
export const invoiceStatus = ["paid", "pending", "failed", "void"] as const;
export type InvoiceStatus = (typeof invoiceStatus)[number];

// Payment method type enum
export const paymentMethodType = ["card", "bank_account", "paypal"] as const;
export type PaymentMethodType = (typeof paymentMethodType)[number];

// Subscription table
export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: uuid("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    status: text("status").$type<SubscriptionStatus>().default("incomplete").notNull(),
    currentPeriodStart: timestamptz("current_period_start").notNull(),
    currentPeriodEnd: timestamptz("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    canceledAt: timestamptz("canceled_at"),
    trialStart: timestamptz("trial_start"),
    trialEnd: timestamptz("trial_end"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_subscription_organization_id").on(table.organizationId),
    index("idx_subscription_user_id").on(table.userId),
    index("idx_subscription_status").on(table.status),
    index("idx_subscription_stripe_subscription_id").on(table.stripeSubscriptionId),
    check(
      "chk_subscription_period_valid",
      sql`${table.currentPeriodEnd} >= ${table.currentPeriodStart}`,
    ),
  ],
);

// Invoice table
export const invoice = pgTable(
  "invoice",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: uuid("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscription.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    currency: text("currency").default("usd").notNull(),
    status: text("status").$type<InvoiceStatus>().default("pending").notNull(),
    invoiceNumber: text("invoice_number").notNull().unique(),
    invoiceDate: timestamptz("invoice_date").notNull(),
    dueDate: timestamptz("due_date"),
    paidAt: timestamptz("paid_at"),
    pdfUrl: text("pdf_url"),
    stripeInvoiceId: text("stripe_invoice_id"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_invoice_organization_id").on(table.organizationId),
    index("idx_invoice_user_id").on(table.userId),
    index("idx_invoice_subscription_id").on(table.subscriptionId),
    index("idx_invoice_status").on(table.status),
    index("idx_invoice_stripe_invoice_id").on(table.stripeInvoiceId),
    check("chk_invoice_amount_non_negative", sql`${table.amount} >= 0`),
  ],
);

// Payment method table
export const paymentMethod = pgTable(
  "payment_method",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: uuid("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<PaymentMethodType>().notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    last4: text("last4"),
    brand: text("brand"),
    expMonth: integer("exp_month"),
    expYear: integer("exp_year"),
    stripePaymentMethodId: text("stripe_payment_method_id"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_payment_method_organization_id").on(table.organizationId),
    index("idx_payment_method_user_id").on(table.userId),
    index("idx_payment_method_stripe_payment_method_id").on(table.stripePaymentMethodId),
  ],
);
