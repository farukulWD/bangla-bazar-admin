import type { Metadata } from "next";

import { BulkImport } from "@/components/import/bulk-import";

export const metadata: Metadata = {
  title: "Import Attributes | Bangla Bazar Admin",
};

export default function ImportAttributesPage() {
  return <BulkImport kind="attribute" />;
}
