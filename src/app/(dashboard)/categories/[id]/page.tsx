import type { Metadata } from "next";

import { CategoryChildren } from "@/components/categories/category-children";

export const metadata: Metadata = {
  title: "Categories | Bangla Bazar Admin",
};

export default function CategoryChildrenPage() {
  return <CategoryChildren />;
}
