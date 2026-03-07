import type { Context as ORPCContext } from "@orpc/server";
import { os } from "@orpc/server";

export function createORPCContext<TContext extends ORPCContext>() {
  return os.$context<TContext>();
}
