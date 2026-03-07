import { Avatar, AvatarFallback, AvatarImage } from "@raypx/design-system/components/ui/avatar";
import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import { IconArrowsSort, IconChevronDown, IconChevronUp, IconPencil } from "@tabler/icons-react";
import type { Column, ColumnDef } from "@tanstack/react-table";
import type { FC } from "react";
import type { AdminUser } from "../types";

type ColumnOptions = {
  onEditUser: (user: AdminUser) => void;
};

function getInitials(name: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Sortable column header component
const SortableHeader: FC<{ column: Column<AdminUser>; title: string }> = ({ column, title }) => {
  const isSorted = column.getIsSorted();

  return (
    <Button
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(isSorted === "asc")}
      variant="ghost"
    >
      {title}
      {isSorted === "asc" ? (
        <IconChevronUp className="ml-2 h-4 w-4" />
      ) : isSorted === "desc" ? (
        <IconChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <IconArrowsSort className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
};

export function getUsersColumns({ onEditUser }: ColumnOptions): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name || "Unknown"}</span>
              {user.username && (
                <span className="text-muted-foreground text-xs">@{user.username}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Email" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string | null;
        return <Badge variant={role === "admin" ? "default" : "secondary"}>{role ?? "user"}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        if (user.banned) {
          return <Badge variant="destructive">Banned</Badge>;
        }
        if (user.emailVerified) {
          return (
            <Badge className="border-green-500/50 text-green-600" variant="outline">
              Verified
            </Badge>
          );
        }
        return (
          <Badge className="border-yellow-500/50 text-yellow-600" variant="outline">
            Unverified
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return <span className="text-muted-foreground text-sm">{formatDate(date)}</span>;
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button onClick={() => onEditUser(user)} size="icon" variant="ghost">
            <IconPencil className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
}
