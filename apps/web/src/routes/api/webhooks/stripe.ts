import {
  getStripe,
  handleCheckoutCompleted,
  handleInvoicePaid,
  handlePaymentMethodAttached,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  type Stripe,
} from "@raypx/stripe";
import { createFileRoute } from "@tanstack/react-router";

import env from "@/env";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET is not configured");
          return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
        }

        const body = await request.text();
        const signature = request.headers.get("stripe-signature");

        if (!signature) {
          return Response.json({ error: "Missing stripe signature" }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
          const stripe = getStripe();
          event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              await handleCheckoutCompleted(session);
              break;
            }

            case "customer.subscription.created":
            case "customer.subscription.updated": {
              const stripeSubscription = event.data.object as Stripe.Subscription;
              await handleSubscriptionUpdated(stripeSubscription);
              break;
            }

            case "customer.subscription.deleted": {
              const stripeSubscription = event.data.object as Stripe.Subscription;
              await handleSubscriptionDeleted(stripeSubscription);
              break;
            }

            case "invoice.paid": {
              const stripeInvoice = event.data.object as Stripe.Invoice;
              await handleInvoicePaid(stripeInvoice);
              break;
            }

            case "payment_method.attached": {
              const paymentMethodObj = event.data.object as Stripe.PaymentMethod;
              await handlePaymentMethodAttached(paymentMethodObj);
              break;
            }

            default:
              // Unhandled event type - silently ignore
              break;
          }

          return Response.json({ received: true });
        } catch (err) {
          console.error("Error processing webhook:", err);
          return Response.json({ error: "Error processing webhook" }, { status: 500 });
        }
      },
    },
  },
});
