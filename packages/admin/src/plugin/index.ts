import { adminConfigPlugin } from "./config";
import { adminRpcPlugin } from "./rpc";
import { adminWebPlugin } from "./web";

export type { AdminPluginManifest } from "../types";
export { adminConfigPlugin } from "./config";
export { adminRpcPlugin } from "./rpc";
export { adminWebPlugin } from "./web";

export const adminPlugin = {
  id: "admin",
  version: "1.0.0",
  rpc: adminRpcPlugin,
  web: adminWebPlugin,
  config: adminConfigPlugin,
} as const;
