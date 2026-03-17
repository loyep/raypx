import type { ExtendedUser } from "@raypx/auth/client";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute, useLoaderData, useNavigate } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { AdminUsersPage } from "@/features/admin/pages/users-page";
import { adminUsersListQueryOptions } from "@/features/admin/queries";
import { getAdminPageComponent, resolveAdminRoute } from "@/plugins/admin-route-resolver";

export const Route = createFileRoute("/(app)/admin/$slug")({
  component: AdminWildcardPage,
  head: () => generatePageHead({ ...siteConfig, title: "Admin - Raypx" }),
  loader: async ({ context, params }) => {
    const { slug } = params;
    if (slug === "users") {
      try {
        await context.queryClient.ensureQueryData(
          adminUsersListQueryOptions({ page: 1, pageSize: 20 }),
        );
      } catch {
        // Non-admin or API error - component will handle redirect/error
      }
    }
  },
});

function AdminWildcardPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useLoaderData({ from: "/(app)" });

  const extendedUser = session.user as ExtendedUser;
  const userRole = extendedUser?.role ?? undefined;

  if (userRole !== "admin" && userRole !== "superadmin") {
    navigate({ to: "/dashboard" });
    return null;
  }

  const resolvedRoute = resolveAdminRoute(slug);
  if (!resolvedRoute) {
    if (import.meta.env.DEV) {
      console.warn(`[admin-router] unknown admin route slug: ${slug}`);
    }
    navigate({ to: "/dashboard" });
    return null;
  }

  const AdminPageComponent = getAdminPageComponent(slug) ?? AdminUsersPage;

  return <AdminPageComponent />;
}
