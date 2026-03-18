import { type AdminUser } from "@raypx/admin";
import { type ExtendedUser, isAdmin } from "@raypx/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@raypx/design-system/components/ui/table";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/(app)/orpc-users")({
  component: ORPCUsersPage,
  head: () => generatePageHead({ ...siteConfig, title: "oRPC Users Test - Raypx" }),
});

function ORPCUsersPage() {
  const { session } = useLoaderData({ from: "/(app)" });
  const user = session.user as ExtendedUser;
  const userIsAdmin = isAdmin(user);

  const usersQuery = useQuery({
    queryKey: ["orpc", "adminUsers", "list"],
    queryFn: async () =>
      (
        await client.admin.users.list({
          page: 1,
          pageSize: 20,
        })
      ).data,
    enabled: userIsAdmin,
  });

  const users = (usersQuery.data?.users as AdminUser[] | undefined) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">oRPC Users Test</h1>
        <p className="text-muted-foreground">
          This page calls <code>client.admin.users.list()</code> from oRPC.
        </p>
      </div>

      {!userIsAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin only</CardTitle>
            <CardDescription>
              Your current role is <code>{user.role ?? "user"}</code>. Switch to an admin account to
              test the users list query.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>
              Loaded from oRPC procedure: <code>admin.users.list</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? <p className="text-sm">Loading users...</p> : null}
            {usersQuery.isError ? (
              <p className="text-destructive text-sm">Failed: {usersQuery.error.message}</p>
            ) : null}
            {usersQuery.data ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell className="capitalize">{item.role ?? "user"}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
