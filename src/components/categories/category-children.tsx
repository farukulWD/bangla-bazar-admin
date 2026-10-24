"use client";

import { useParams } from "next/navigation";

import { CategoriesTable } from "./categories-table";

export function CategoryChildren() {
  const { id } = useParams<{ id: string }>();

  return <CategoriesTable key={id} parentId={id} />;
}
