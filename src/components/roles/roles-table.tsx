"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api-error";
import { isSuperAdmin } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useDeleteRoleMutation,
  useGetRolesQuery,
} from "@/store/api/role/api/roleApi";
import type { Role } from "@/store/api/role/types";

const countPermissions = (role: Role) =>
  role.modules.reduce(
    (total, entry) =>
      total + Object.values(entry.permissions ?? {}).filter(Boolean).length,
    0
  );

export function RolesTable() {
  const { user } = useSession();
  const canManage = isSuperAdmin(user);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);
  const searchTerm = useDebouncedValue(search.trim());

  const { data, isFetching, isLoading, error } = useGetRolesQuery({
    searchTerm: searchTerm || undefined,
    page,
    limit: 10,
    sort: "-createdAt",
  });
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteRole(pendingDelete._id).unwrap();
      toast.success(`Role "${pendingDelete.name}" deleted.`);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the role."));
    }
  };

  const roles = data?.data ?? [];

  return (
    <div className="w-full">
      <PageHeader
        title="Roles"
        description="Group permissions into roles, then assign a role to each staff member."
        actions={
          canManage && (
            <Button render={<Link href="/roles/new" />} nativeButton={false}>
              <Plus />
              New role
            </Button>
          )
        }
      />

      <Card className="gap-0 py-0">
        <div className="border-b p-4">
          <div className="relative max-w-sm">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search roles"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? "opacity-60" : ""}>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5} className="px-4">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && error && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {getErrorMessage(error, "Could not load roles.")}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && roles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            )}

            {roles.map((role) => (
              <TableRow key={role._id}>
                <TableCell className="pl-4 font-medium">{role.name}</TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                  {role.description || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{countPermissions(role)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isActive ? "outline" : "destructive"}>
                    {role.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={canManage ? "Edit role" : "View role"}
                      render={<Link href={`/roles/${role._id}`} />}
                      nativeButton={false}
                    >
                      <Pencil />
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete role"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(role)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete role?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> will be removed permanently. A
            role that is still assigned to staff cannot be deleted.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
