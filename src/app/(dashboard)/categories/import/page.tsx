import type { Metadata } from "next";

import { BulkImport } from "@/components/import/bulk-import";

export const metadata: Metadata = {
  title: "Import Categories | Bangla Bazar Admin",
};

export default function ImportCategoriesPage() {
  return <BulkImport kind="category" />;
}
