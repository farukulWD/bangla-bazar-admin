"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { UserType } from "@/store/api/auth/types";
import { useGetRolesQuery } from "@/store/api/role/api/roleApi";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useSetUserStatusMutation,
} from "@/store/api/user/api/userApi";
import type { StaffUser } from "@/store/api/user/types";

import { UserSheet } from "./user-sheet";

const ALL = "all";

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function UsersTable() {
  const { user: me } = useSession();
  const canAdd = can(me, "user", "can_add_user");
  const canEdit = can(me, "user", "can_edit_user");
  const canToggle = can(me, "user", "can_deactivate_user");
  const canDelete = can(me, "user", "can_delete_user");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StaffUser | null>(null);
  const searchTerm = useDebouncedValue(search.trim());

  const { data, isFetching, isLoading, error } = useGetUsersQuery({
    userType: `${UserType.Admin},${UserType.SuperAdmin}`,
    searchTerm: searchTerm || undefined,
    role: roleFilter === ALL ? undefined : roleFilter,
    isActive: statusFilter === ALL ? undefined : statusFilter === "active",
    page,
    limit: 10,
  });
  const { data: roles } = useGetRolesQuery({ limit: 100, sort: "name" });
  const [setStatus] = useSetUserStatusMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const roleOptions = (roles?.data ?? [])
    .filter((role) => role.isActive)
    .map((role) => ({ label: role.name, value: role._id }));
  const roleFilters = [
    { label: "All roles", value: ALL },
    ...(roles?.data ?? []).map((role) => ({ label: role.name, value: role._id })),
  ];

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setEditing(user);
    setSheetOpen(true);
  };

  const onToggleStatus = async (user: StaffUser, active: boolean) => {
    try {
      await setStatus({
        id: user._id,
        status: active ? "active" : "inactive",
      }).unwrap();
      toast.success(`${user.name} is now ${active ? "active" : "inactive"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteUser(pendingDelete._id).unwrap();
      toast.success(`${pendingDelete.name} deleted.`);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the user."));
    }
  };

  const users = data?.data ?? [];

  return (
    <div className="w-full">
      <PageHeader
        title="Users"
        description="Staff accounts that can sign in to the admin panel."
        actions={
          canAdd && (
            <Button onClick={openCreate}>
              <Plus />
              New user
            </Button>
          )
        }
      />

      <Card className="gap-0 overflow-clip py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
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
              placeholder="Search name, email or phone"
              className="h-9 pl-9"
            />
          </div>

          <Select
            items={roleFilters}
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value ?? ALL);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleFilters.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={STATUS_FILTERS}
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? ALL);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? "opacity-60" : ""}>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6} className="px-4">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {getErrorMessage(error, "Could not load users.")}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {users.map((user) => {
              const superAdmin = user.userType === UserType.SuperAdmin;
              const self = user._id === me?._id;
              const locked = superAdmin || self;

              return (
                <TableRow key={user._id}>
                  <TableCell className="pl-4">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      {user.email ?? user.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>{user.email ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {superAdmin ? (
                      <Badge>Super admin</Badge>
                    ) : user.role ? (
                      <Badge variant={user.role.isActive ? "secondary" : "destructive"}>
                        {user.role.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No role</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      aria-label="Active"
                      checked={user.status === "active"}
                      disabled={!canToggle || locked}
                      onCheckedChange={(checked) =>
                        onToggleStatus(user, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {dateFormat.format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit user"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil />
                        </Button>
                      )}
                      {canDelete && !locked && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete user"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(user)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <UserSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={editing}
        roleOptions={roleOptions}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete user?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> will lose access to the admin
            panel.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
