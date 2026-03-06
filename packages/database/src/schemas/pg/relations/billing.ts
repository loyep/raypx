import { defineRelations } from "drizzle-orm";
import { user } from "../auth";
import { organization } from "../organizations";
import { invoice, paymentMethod, subscription } from "../subscription";

export const billingRelations = defineRelations(
  { subscription, user, organization, invoice, paymentMethod },
  (r) => ({
    subscription: {
      user: r.one.user({
        from: r.subscription.userId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.subscription.organizationId,
        to: r.organization.id,
      }),
      invoices: r.many.invoice({
        from: r.subscription.id,
        to: r.invoice.subscriptionId,
      }),
    },
    invoice: {
      user: r.one.user({
        from: r.invoice.userId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.invoice.organizationId,
        to: r.organization.id,
      }),
      subscription: r.one.subscription({
        from: r.invoice.subscriptionId,
        to: r.subscription.id,
      }),
    },
    paymentMethod: {
      user: r.one.user({
        from: r.paymentMethod.userId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.paymentMethod.organizationId,
        to: r.organization.id,
      }),
    },
  }),
);
