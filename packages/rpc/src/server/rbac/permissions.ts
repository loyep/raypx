import { USER_ROLES } from "@raypx/shared";

export const permissions = [
  "users:read",
  "users:update",
  "dashboard:read",
  "storage:write",
  "billing:read",
  "billing:manage",
] as const;

export type Permission = (typeof permissions)[number];

export const roles = USER_ROLES;
export type Role = (typeof roles)[number];

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  admin: new Set(permissions),
  superadmin: new Set(permissions),
  user: new Set(["dashboard:read", "storage:write", "billing:read", "billing:manage"]),
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (role === "admin" || role === "superadmin") {
    return true;
  }

  const normalizedRole: Role = role === "user" ? "user" : "user";
  return ROLE_PERMISSIONS[normalizedRole].has(permission);
}
