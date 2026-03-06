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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@raypx/design-system/components/ui/select";
import { Switch } from "@raypx/design-system/components/ui/switch";
import { type FC, useEffect, useState } from "react";
import type { AdminUser, AdminUserRole } from "../types";

type UserEditDialogProps = {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    id: string;
    role?: AdminUserRole;
    banned?: boolean;
    banReason?: string;
  }) => Promise<void>;
};

export const UserEditDialog: FC<UserEditDialogProps> = ({ user, open, onOpenChange, onSave }) => {
  const [role, setRole] = useState<AdminUserRole>("user");
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    if (user && open) {
      setRole((user.role as AdminUserRole) ?? "user");
      setBanned(user.banned ?? false);
      setBanReason(user.banReason ?? "");
    }
  }, [user, open]);

  // Update form when dialog opens with new user
  function handleOpenChange(newOpen: boolean) {
    if (newOpen && user) {
      setRole((user.role as AdminUserRole) ?? "user");
      setBanned(user.banned ?? false);
      setBanReason(user.banReason ?? "");
    }
    onOpenChange(newOpen);
  }

  async function handleSave() {
    if (!user) return;

    setLoading(true);
    try {
      await onSave({
        id: user.id,
        role,
        banned,
        banReason: banned ? banReason : undefined,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user role and ban status for {user.name || user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(v) => setRole(v as AdminUserRole)} value={role}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="banned">Banned</Label>
              <p className="text-muted-foreground text-xs">
                Prevent this user from accessing the platform
              </p>
            </div>
            <Switch checked={banned} id="banned" onCheckedChange={setBanned} />
          </div>
          {banned && (
            <div className="grid gap-2">
              <Label htmlFor="banReason">Ban Reason</Label>
              <Input
                id="banReason"
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for ban"
                value={banReason}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleSave}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
