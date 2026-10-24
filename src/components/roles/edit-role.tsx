"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { useGetRoleQuery } from "@/store/api/role/api/roleApi";

import { RoleForm } from "./role-form";

export function EditRole() {
  const { id } = useParams<{ id: string }>();
  const { data: role, isLoading, error } = useGetRoleQuery(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Role not found.")}
      </p>
    );
  }

  return <RoleForm key={role._id + role.updatedAt} role={role} />;
}
