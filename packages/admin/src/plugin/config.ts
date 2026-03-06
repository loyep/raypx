import type { AdminConfigPluginContribution } from "../types";

export const adminConfigPlugin: AdminConfigPluginContribution = {
  defaults: {
    admin: {
      users: {
        enabled: true,
      },
    },
  },
};
