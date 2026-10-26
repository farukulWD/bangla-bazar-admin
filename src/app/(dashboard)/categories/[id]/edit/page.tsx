import type { Metadata } from "next";

import { EditCategory } from "@/components/categories/edit-category";

export const metadata: Metadata = {
  title: "Edit Category | Bangla Bazar Admin",
};

export default function EditCategoryPage() {
  return <EditCategory />;
}
