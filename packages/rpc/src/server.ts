/**
 * @raypx/rpc - Server entry
 * For client-side RPC calls, use @raypx/rpc/client
 */

export { systemService as rpcSystemService } from "./server/application/system/service";
export * from "./server/context";
export type { AppRouter, AppRouterClient } from "./server/routers";
export { appRouter } from "./server/routers";
export * from "./server/transport/handler";
