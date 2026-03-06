import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { type AdminUser, UserEditDialog, UsersTable } from "@raypx/admin";
import { getUserStats, listUsers, updateUser } from "@raypx/admin/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { Input } from "@raypx/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@raypx/design-system/components/ui/select";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { toast } from "@raypx/design-system/components/ui/toast";
import { cn } from "@raypx/design-system/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { client } from "@/utils/orpc";
import { AdminPagination } from "./admin-pagination";

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [committedPage, setCommittedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [bannedFilter, setBannedFilter] = useState<string>("all");

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const requestPage = pendingPage ?? committedPage;
  const isPageTransitioning = pendingPage !== null;

  const usersQuery = useQuery({
    queryKey: ["adminUsers", "list", requestPage, debouncedSearch, roleFilter, bannedFilter],
    queryFn: () =>
      listUsers(client, {
        page: requestPage,
        pageSize: 10,
        search: debouncedSearch || undefined,
        role: roleFilter !== "all" ? (roleFilter as "admin" | "user" | "superadmin") : undefined,
        banned: bannedFilter !== "all" ? bannedFilter === "banned" : undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (pendingPage === null) return;
    if (usersQuery.isFetching) return;

    if (usersQuery.isError) {
      toast.error("Failed to load users page");
      setPendingPage(null);
      return;
    }

    if (usersQuery.isSuccess) {
      setCommittedPage(pendingPage);
      setPendingPage(null);
    }
  }, [pendingPage, usersQuery.isFetching, usersQuery.isError, usersQuery.isSuccess]);

  const statsQuery = useQuery({
    queryKey: ["adminUsers", "stats"],
    queryFn: () => getUserStats(client),
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser.bind(null, client),
    onSuccess: async () => {
      toast.success("User updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  const users = (usersQuery.data?.users as AdminUser[] | undefined) ?? [];
  const pagination = usersQuery.data?.pagination ?? null;
  const stats = statsQuery.data ?? null;
  const isLoading = usersQuery.isLoading && !usersQuery.data;

  const handlePageChange = (nextPage: number) => {
    if (isPageTransitioning || nextPage === committedPage || nextPage < 1) return;
    setPendingPage(nextPage);
  };

  const handleEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async (updateData: {
    id: string;
    role?: "admin" | "user" | "superadmin";
    banned?: boolean;
    banReason?: string;
  }) => {
    try {
      await updateUserMutation.mutateAsync(updateData);
    } catch {
      // Error toast is handled by mutation onError.
    }
  };

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stats.admins}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">Banned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-destructive">{stats.banned}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stats.verified}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCommittedPage(1);
                    setPendingPage(null);
                  }}
                  placeholder="Search by name or email..."
                  value={search}
                />
              </div>
              <Select
                onValueChange={(v) => {
                  if (v) setRoleFilter(v);
                  setCommittedPage(1);
                  setPendingPage(null);
                }}
                value={roleFilter}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) => {
                  if (v) setBannedFilter(v);
                  setCommittedPage(1);
                  setPendingPage(null);
                }}
                value={bannedFilter}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : (
              <div className="relative">
                <div className={cn(isPageTransitioning && "pointer-events-none opacity-60")}>
                  <UsersTable
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    onEditUser={handleEditUser}
                    users={users}
                  />
                </div>
                {isPageTransitioning && (
                  <div className="absolute inset-0 grid place-items-center rounded-md bg-background/45 backdrop-blur-[0.5px]">
                    <Spinner className="size-5 text-muted-foreground/80" />
                  </div>
                )}
              </div>
            )}

            {pagination && (
              <AdminPagination
                currentPage={committedPage}
                isTransitioning={isPageTransitioning}
                onPageChange={handlePageChange}
                totalPages={pagination.totalPages}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <UserEditDialog
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveUser}
        open={editDialogOpen}
        user={editingUser}
      />
    </>
  );
}
