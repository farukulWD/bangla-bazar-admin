import type { Metadata } from "next";

import { CategoryForm } from "@/components/categories/category-form";

export const metadata: Metadata = {
  title: "New Category | Bangla Bazar Admin",
};

export default function NewCategoryPage() {
  return <CategoryForm />;
}
