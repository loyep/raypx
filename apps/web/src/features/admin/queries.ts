import { listUsers } from "@raypx/admin/api";
import { queryOptions } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

export const adminUsersListQueryOptions = (params: { page?: number; pageSize?: number }) =>
  queryOptions({
    queryKey: ["adminUsers", "list", params.page ?? 1] as const,
    queryFn: () =>
      listUsers(client, {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      }),
  });
