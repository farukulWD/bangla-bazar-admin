import type { Metadata } from "next";

import { ProductImport } from "@/components/products/product-import";

export const metadata: Metadata = {
  title: "Import Products | Bangla Bazar Admin",
};

export default function ImportProductsPage() {
  return <ProductImport />;
}
