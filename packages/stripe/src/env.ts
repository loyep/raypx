import { createEnv, stripeEnv } from "@raypx/config";
import Stripe from "stripe";

export function getStripe(): Stripe {
  const env = createEnv(stripeEnv);

  if (!env.STRIPE_PRIVATE_KEY) {
    throw new Error("STRIPE_PRIVATE_KEY is not configured");
  }

  return new Stripe(env.STRIPE_PRIVATE_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}
