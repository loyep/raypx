import { Button } from "@raypx/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { IconLayoutGrid } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth";

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** First-time creation (no workspace), cannot be dismissed */
  isFirst?: boolean;
};

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  isFirst = false,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setSlug("");
      setError(null);
    }
  }, [open]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
      setSlug(
        value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  }

  async function handleCreate() {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName) {
      setError("Please enter workspace name");
      return;
    }
    if (!trimmedSlug) {
      setError("Please enter workspace slug");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const { error: err } = await authClient.organization.create({
        name: trimmedName,
        slug: trimmedSlug,
      });
      if (err) {
        setError(err.message ?? "Failed to create");
        return;
      }
      await router.invalidate();
      onOpenChange?.(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog
      modal
      onOpenChange={(v) => {
        if (!isFirst && onOpenChange) {
          onOpenChange(typeof v === "boolean" ? v : (v as { open: boolean }).open);
        }
      }}
      open={open}
    >
      <DialogContent className="max-w-md" showCloseButton={!isFirst}>
        <DialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <IconLayoutGrid className="size-6 text-primary" />
          </div>
          <DialogTitle>
            {isFirst ? "Create your first workspace" : "Create new workspace"}
          </DialogTitle>
          <DialogDescription>
            {isFirst
              ? "Workspaces help you organize projects and teams. Create one to get started."
              : "Add a new workspace to organize different projects and teams."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. My Team"
              value={name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-slug">Workspace slug</Label>
            <Input
              id="workspace-slug"
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. my-team"
              value={slug}
            />
            <p className="text-muted-foreground text-xs">
              For URLs, lowercase letters, numbers and hyphens only
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isCreating || !name.trim()} onClick={handleCreate}>
            {isCreating ? "Creating..." : "Create workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
