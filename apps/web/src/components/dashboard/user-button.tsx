import { GearIcon, LockKeyIcon, PersonIcon, SignOutIcon } from "@phosphor-icons/react";
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
import { Link } from "@tanstack/react-router";

interface UserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initials: string;
  onSignOut: () => void;
}

export function UserButton({ user, initials, onSignOut }: UserButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="gap-2" variant="ghost">
            <Avatar className="h-8 w-8">
              <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden font-normal md:inline-flex">{user.name || "User"}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm">{user.name || "User"}</p>
              <p className="font-normal text-muted-foreground text-xs">{user.email ?? ""}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/settings/profile" />}>
          <PersonIcon className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/settings" />}>
          <GearIcon className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/settings/api-keys" />}>
          <LockKeyIcon className="mr-2 size-4" />
          API Keys
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onSignOut}>
          <SignOutIcon className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
