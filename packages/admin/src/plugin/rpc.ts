import { createAdminUsersRouter } from "../internal/rpc-router";
import type { AdminRpcPluginContribution } from "../types";

export const adminRpcPlugin: AdminRpcPluginContribution = {
  namespace: "admin",
  createRouter: ({ requirePermission }) => ({
    users: createAdminUsersRouter({ requirePermission }),
  }),
};
