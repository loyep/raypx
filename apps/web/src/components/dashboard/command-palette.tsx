import {
  ChatCircleDotsIcon,
  GearIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PersonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@raypx/design-system/components/ui/command";
import { useTheme } from "@raypx/design-system/hooks/use-theme";
import { useNavigate } from "@tanstack/react-router";
import { type FC, useCallback, useEffect, useState } from "react";
import { signOut } from "@/lib/auth";

type CommandPaletteProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const CommandPalette: FC<CommandPaletteProps> = ({ open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme, resolvedTheme } = useTheme();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate({ to: "/" });
    setOpen(false);
  }, [navigate, setOpen]);

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
    setOpen(false);
  }, [resolvedTheme, setTheme, setOpen]);

  const handleNavigate = useCallback(
    (to: string) => {
      navigate({ to });
      setOpen(false);
    },
    [navigate, setOpen],
  );

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleNavigate("/dashboard")}>
              <LightningIcon className="size-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/chat")}>
              <ChatCircleDotsIcon className="size-4" />
              AI Chat
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Links">
            <CommandItem disabled>
              <PersonIcon className="size-4" />
              Projects (Coming Soon)
            </CommandItem>
            <CommandItem disabled>
              <GearIcon className="size-4" />
              Settings (Coming Soon)
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleThemeToggle}>
              {resolvedTheme === "light" ? (
                <MoonIcon className="size-4" />
              ) : (
                <SunIcon className="size-4" />
              )}
              {resolvedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </CommandItem>
            <CommandItem className="text-destructive" onSelect={handleSignOut}>
              <SignOutIcon className="size-4" />
              Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

export function CommandPaletteTrigger({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted ${className ?? ""}`}
      onClick={onClick}
      type="button"
    >
      <MagnifyingGlassIcon className="size-4" />
      <span className="hidden md:inline">Search...</span>
      <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
