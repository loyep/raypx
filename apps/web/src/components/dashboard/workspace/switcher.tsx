import { authClient } from "@raypx/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@raypx/design-system/components/ui/dropdown-menu";
import { IconCheck, IconChevronDown, IconLayoutGrid, IconPlus } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { type FC, useEffect, useRef, useState } from "react";
import { CreateWorkspaceDialog } from "./dialog";

const STORAGE_KEY_PREFIX = "raypx-active-workspace";

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

type WorkspaceSwitcherProps = {
  activeOrganizationId?: string | null;
  userId?: string;
};

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({ activeOrganizationId, userId }) => {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const restoredRef = useRef(false);
  const { data: organizations, isPending } = authClient.useListOrganizations();

  // Restore last workspace from localStorage when session has no active org
  useEffect(() => {
    if (!userId || isPending || !organizations?.length || activeOrganizationId) return;
    if (restoredRef.current) return;
    const key = getStorageKey(userId);
    const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!saved || !organizations.some((org) => org.id === saved)) return;
    restoredRef.current = true;
    authClient.organization.setActive({ organizationId: saved }).then(({ error }) => {
      if (!error) router.invalidate();
    });
  }, [userId, isPending, organizations, activeOrganizationId, router]);

  async function handleSwitch(organizationId: string) {
    if (organizationId === activeOrganizationId) return;
    const { error } = await authClient.organization.setActive({ organizationId });
    if (!error) {
      if (userId && typeof window !== "undefined") {
        localStorage.setItem(getStorageKey(userId), organizationId);
      }
      await router.invalidate();
    }
  }

  const activeOrg = organizations?.find((org) => org.id === activeOrganizationId);
  const displayName = activeOrg?.name ?? "Select workspace";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              type="button"
            >
              <IconLayoutGrid className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{displayName}</span>
              <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {isPending ? (
              <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
            ) : !organizations?.length ? (
              <DropdownMenuItem disabled>No workspaces</DropdownMenuItem>
            ) : (
              organizations.map((org) => (
                <DropdownMenuItem key={org.id} onSelect={() => handleSwitch(org.id)}>
                  <span className="mr-2 flex size-4 shrink-0 items-center justify-center">
                    {org.id === activeOrganizationId ? <IconCheck className="size-4" /> : null}
                  </span>
                  <span className="truncate">{org.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateWorkspaceDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
    </>
  );
};
