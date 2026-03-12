import {
  createAdminKeyPoolRouter,
  createAdminPromptPoliciesRouter,
  createAdminUsageOverviewRouter,
  createAdminUsersRouter,
} from "../internal/rpc-router";
import type { AdminRpcPluginContribution } from "../types";

export const adminRpcPlugin: AdminRpcPluginContribution = {
  namespace: "admin",
  createRouter: ({ requirePermission }) => ({
    users: createAdminUsersRouter({ requirePermission }),
    keyPool: createAdminKeyPoolRouter({ requirePermission }),
    promptPolicies: createAdminPromptPoliciesRouter({ requirePermission }),
    usageOverview: createAdminUsageOverviewRouter({ requirePermission }),
  }),
};
