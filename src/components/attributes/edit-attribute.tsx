"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { useGetAttributeQuery } from "@/store/api/attribute/api/attributeApi";

import { AttributeForm } from "./attribute-form";

export function EditAttribute() {
  const { id } = useParams<{ id: string }>();
  const { data: attribute, isLoading, error } = useGetAttributeQuery(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !attribute) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Attribute not found.")}
      </p>
    );
  }

  return (
    <AttributeForm
      key={attribute._id + attribute.updatedAt}
      attribute={attribute}
    />
  );
}
