"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { useGetCategoryQuery } from "@/store/api/category/api/categoryApi";

import { CategoryForm } from "./category-form";

export function EditCategory() {
  const { id } = useParams<{ id: string }>();
  const { data: category, isLoading, error } = useGetCategoryQuery(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Category not found.")}
      </p>
    );
  }

  return (
    <CategoryForm key={category._id + category.updatedAt} category={category} />
  );
}
