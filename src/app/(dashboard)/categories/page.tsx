import type { Metadata } from "next";

import { CategoriesTable } from "@/components/categories/categories-table";

export const metadata: Metadata = {
  title: "Categories | Bangla Bazar Admin",
};

export default function CategoriesPage() {
  return <CategoriesTable />;
}
