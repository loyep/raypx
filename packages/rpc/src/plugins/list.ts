import { adminRouter } from "../modules/admin/router";
import { billingRouter } from "../modules/billing/router";
import { dashboardRouter } from "../modules/dashboard/router";
import { storageRouter } from "../modules/storage/router";
import type { RpcPlugin } from "./compose";

export function createRpcPluginList() {
  return [
    {
      id: "billing",
      version: "1.0.0",
      rpc: {
        namespace: "billing",
        router: billingRouter,
      },
    },
    {
      id: "dashboard",
      version: "1.0.0",
      rpc: {
        namespace: "dashboard",
        router: dashboardRouter,
      },
    },
    {
      id: "storage",
      version: "1.0.0",
      rpc: {
        namespace: "storage",
        router: storageRouter,
      },
    },
    {
      id: "admin",
      version: "1.0.0",
      rpc: {
        namespace: "admin",
        router: adminRouter,
      },
    },
  ] as const satisfies readonly RpcPlugin[];
}
