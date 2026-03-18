import { adminRpcPlugin } from "@raypx/admin/plugin";
import { requirePermission } from "../../transport/middleware";

export const adminRouter = adminRpcPlugin.createRouter({
  requirePermission: requirePermission as unknown as (permission: string) => any,
});
