import { type AdminUser, UserEditDialog, UsersTable } from "@raypx/admin";
import { updateUser } from "@raypx/admin/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@raypx/design-system/components/ui/pagination";
import { toast } from "@raypx/design-system/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminUsersListQueryOptions } from "@/features/admin/queries";
import { client } from "@/utils/orpc";

const PAGE_SIZE = 20;

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const usersQuery = useQuery(adminUsersListQueryOptions({ page, pageSize: PAGE_SIZE }));

  const updateUserMutation = useMutation({
    mutationFn: updateUser.bind(null, client),
    onSuccess: async () => {
      toast.success("User updated");
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  const users = (usersQuery.data?.users as AdminUser[] | undefined) ?? [];
  const pagination = usersQuery.data?.pagination ?? null;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Users</h1>
          <p className="text-muted-foreground">View and manage users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : usersQuery.isError ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-destructive">
                <span>Failed to load users</span>
                {usersQuery.error instanceof Error && (
                  <span className="text-muted-foreground text-sm">{usersQuery.error.message}</span>
                )}
                <button
                  className="text-primary text-sm hover:underline"
                  onClick={() => usersQuery.refetch()}
                  type="button"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <UsersTable
                  onEditUser={(u) => {
                    setEditingUser(u);
                    setEditDialogOpen(true);
                  }}
                  users={users}
                />
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            aria-disabled={page <= 1}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                            }}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="px-4 py-2 text-sm">
                            {page} / {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            aria-disabled={page >= totalPages}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page < totalPages) setPage(page + 1);
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <UserEditDialog
        onOpenChange={setEditDialogOpen}
        onSave={async (data) => {
          await updateUserMutation.mutateAsync(data);
        }}
        open={editDialogOpen}
        user={editingUser}
      />
    </>
  );
}
