import { Avatar, AvatarFallback, AvatarImage } from "@raypx/design-system/components/ui/avatar";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@raypx/design-system/components/ui/dropdown-menu";
import {
  IconChevronDown,
  IconGauge,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { LoginDialog } from "@/components/auth";
import { signOut, useSession } from "@/lib/auth";

export function UserButton() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoggedIn) {
    const user = session.user;
    const initials = (user.name || user.email || "U")?.[0]?.toUpperCase() ?? "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button className="h-9 gap-2 pr-2 pl-2.5" variant="outline">
              <Avatar className="h-6 w-6">
                <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate sm:inline">
                {user.name || "Account"}
              </span>
              <IconChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="font-medium text-sm">{user.name || "User"}</p>
                <p className="font-normal text-muted-foreground text-xs">{user.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link to="/dashboard" />}>
            <IconGauge className="mr-2 size-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/settings/profile" />}>
            <IconUser className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/settings" />}>
            <IconSettings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={async () => {
              await signOut();
            }}
          >
            <IconLogout className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="default">
        Sign in
      </Button>
      <LoginDialog onOpenChange={setDialogOpen} open={dialogOpen} />
    </>
  );
}
