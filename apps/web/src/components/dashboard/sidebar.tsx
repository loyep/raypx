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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@raypx/design-system/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@raypx/design-system/components/ui/sidebar";
import {
  IconBolt,
  IconLock,
  IconLogout,
  IconMessageCircle,
  IconSelector,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { FC } from "react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

type SidebarNavigationProps = {
  onNavigate?: () => void;
  items: NavigationItem[];
  activeNavKey?: string | null;
};

type NavigationItem = {
  key: string;
  label: string;
  to: "/dashboard" | "/chat" | `/admin/${string}`;
  icon: "lightning" | "chat" | "users" | "person" | "gear";
  isActive?: boolean;
  soon?: boolean;
  disabled?: boolean;
};

export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  onNavigate,
  items,
  activeNavKey,
}) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const iconMap: Record<NavigationItem["icon"], FC<{ className?: string }>> = {
    lightning: IconBolt,
    chat: IconMessageCircle,
    users: IconUsers,
    person: IconUser,
    gear: IconSettings,
  };
  const resolvedItems: NavigationItem[] = items.map((item) => ({
    ...item,
    isActive: item.disabled
      ? false
      : activeNavKey
        ? item.key === activeNavKey
        : pathname === item.to || pathname.startsWith(`${item.to}/`),
  }));

  return (
    <SidebarContent className="p-3">
      <SidebarMenu>
        {resolvedItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton
                disabled={item.disabled}
                isActive={item.isActive}
                onClick={onNavigate}
                render={
                  item.to.startsWith("/admin/") ? (
                    <Link params={{ slug: item.to.replace("/admin/", "") }} to="/admin/$slug" />
                  ) : (
                    <Link to={item.to} />
                  )
                }
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
                {item.soon && (
                  <span className="ml-auto text-muted-foreground/60 text-xs">Soon</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarContent>
  );
};

type SidebarUserProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initials: string;
  onSignOut: () => void;
};

export function SidebarUser({ user, initials, onSignOut }: SidebarUserProps) {
  const appVersion = import.meta.env.VITE_APP_VERSION ?? "dev";

  return (
    <SidebarFooter className="border-t p-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button className="h-auto w-full justify-start gap-3 p-2" variant="ghost">
              <Avatar className="h-9 w-9">
                <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate font-medium text-sm">{user.name || "User"}</p>
                <p className="truncate text-muted-foreground text-xs">{user.email ?? ""}</p>
              </div>
              <IconSelector className="size-4 text-muted-foreground" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Account</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link to="/settings/profile" />}>
            <IconUser className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/settings" />}>
            <IconSettings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/settings/api-keys" />}>
            <IconLock className="mr-2 size-4" />
            API Keys
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            Version
            <span className="ml-auto font-mono text-xs">v{appVersion}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={onSignOut}>
            <IconLogout className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}

type SidebarLogoProps = {
  onNavigate?: () => void;
};

export function SidebarLogo({ onNavigate }: SidebarLogoProps) {
  return (
    <SidebarHeader className="flex h-16 flex-row items-center justify-start gap-2 border-b px-6">
      <Link className="flex items-center gap-2" onClick={onNavigate} to="/">
        <Logo />
        <span className="font-semibold">{siteConfig.name}</span>
      </Link>
    </SidebarHeader>
  );
}

type DashboardSidebarProps = {
  user: SidebarUserProps["user"];
  initials: string;
  navigationItems: NavigationItem[];
  activeNavKey?: string | null;
  onSignOut: () => void;
};

export const DashboardSidebar: FC<DashboardSidebarProps> = ({
  user,
  initials,
  navigationItems,
  activeNavKey,
  onSignOut,
}) => {
  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">
      <SidebarProvider className="min-h-screen">
        <Sidebar className="h-screen border-r bg-muted/30" collapsible="none">
          <SidebarLogo />
          <SidebarNavigation activeNavKey={activeNavKey} items={navigationItems} />
          <SidebarUser initials={initials} onSignOut={onSignOut} user={user} />
        </Sidebar>
      </SidebarProvider>
    </aside>
  );
};

type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SidebarUserProps["user"];
  initials: string;
  navigationItems: NavigationItem[];
  activeNavKey?: string | null;
  onSignOut: () => void;
};

export const MobileSidebar: FC<MobileSidebarProps> = ({
  open,
  onOpenChange,
  user,
  initials,
  navigationItems,
  activeNavKey,
  onSignOut,
}) => {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-72 p-0" side="left">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarProvider className="h-full">
          <Sidebar className="h-full" collapsible="none">
            <SidebarLogo onNavigate={() => onOpenChange(false)} />
            <SidebarNavigation
              activeNavKey={activeNavKey}
              items={navigationItems}
              onNavigate={() => onOpenChange(false)}
            />
            <SidebarUser initials={initials} onSignOut={onSignOut} user={user} />
          </Sidebar>
        </SidebarProvider>
      </SheetContent>
    </Sheet>
  );
};
