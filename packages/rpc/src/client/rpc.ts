import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { rpcLink } from "./link";

const client = createORPCClient(rpcLink) as any;

export const orpc = createTanstackQueryUtils(client);
export { client };
export type ORPC = typeof orpc;
