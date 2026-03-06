import { type ApiResponse, unwrapApiResponse } from "../api-response";
import type {
  AdminUser,
  AdminUserStats,
  AdminUsersListInput,
  AdminUsersListResult,
  AdminUserUpdateInput,
} from "../types";

export type AdminApiClient = {
  admin: {
    users: {
      list: (
        input: AdminUsersListInput,
      ) => Promise<AdminUsersListResult | ApiResponse<AdminUsersListResult>>;
      update: (
        input: AdminUserUpdateInput,
      ) => Promise<(AdminUser | null) | ApiResponse<AdminUser | null>>;
      stats: () => Promise<AdminUserStats | ApiResponse<AdminUserStats>>;
    };
  };
};

export async function listUsers(client: AdminApiClient, input: AdminUsersListInput) {
  return unwrapApiResponse(await client.admin.users.list(input));
}

export async function updateUser(client: AdminApiClient, input: AdminUserUpdateInput) {
  return unwrapApiResponse(await client.admin.users.update(input));
}

export async function getUserStats(client: AdminApiClient) {
  return unwrapApiResponse(await client.admin.users.stats());
}
