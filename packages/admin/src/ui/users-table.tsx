import {
  DataTable,
  DataTableColumnVisibility,
  useDataTable,
} from "@raypx/design-system/components/ui/data-table";
import type { OnChangeFn, VisibilityState } from "@tanstack/react-table";
import type { FC } from "react";
import type { AdminUser } from "../types";
import { getUsersColumns } from "./users-columns";

type UsersTableProps = {
  users: AdminUser[];
  onEditUser: (user: AdminUser) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
};

export const UsersTable: FC<UsersTableProps> = ({
  users,
  onEditUser,
  columnVisibility,
  onColumnVisibilityChange,
}) => {
  const columns = getUsersColumns({ onEditUser });

  const { table } = useDataTable(users, columns, {
    columnVisibility,
    onColumnVisibilityChange,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DataTableColumnVisibility table={table} />
      </div>
      <DataTable
        columns={columns}
        columnVisibility={columnVisibility}
        data={users}
        emptyMessage="No users found."
        onColumnVisibilityChange={onColumnVisibilityChange}
      />
    </div>
  );
};

// Re-export AdminUser type for backwards compatibility
export type { AdminUser } from "../types";
