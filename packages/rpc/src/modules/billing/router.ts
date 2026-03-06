import { z } from "zod";
import { billingService } from "../../application/billing/service";
import { protectedProcedure } from "../../transport/middleware";

export const billingRouter = {
  subscription: {
    get: protectedProcedure.handler(async ({ context }) => {
      return billingService.getSubscription(context);
    }),
  },

  checkout: {
    create: protectedProcedure
      .input(
        z.object({
          priceId: z.string(),
          successUrl: z.string().url().optional(),
          cancelUrl: z.string().url().optional(),
        }),
      )
      .handler(async ({ context, input }) => {
        return billingService.createCheckout(context, input);
      }),
  },

  portal: {
    createSession: protectedProcedure
      .input(
        z.object({
          returnUrl: z.string().url().optional(),
        }),
      )
      .handler(async ({ context, input }) => {
        return billingService.createPortalSession(context, input);
      }),
  },

  paymentMethods: {
    list: protectedProcedure.handler(async ({ context }) => {
      return billingService.getPaymentMethods(context);
    }),
  },

  invoices: {
    list: protectedProcedure.handler(async ({ context }) => {
      return billingService.getInvoices(context);
    }),
  },
};
