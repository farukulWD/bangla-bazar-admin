import type { Metadata } from "next";

import { ProductsTable } from "@/components/products/products-table";

export const metadata: Metadata = {
  title: "Products | Bangla Bazar Admin",
};

export default function ProductsPage() {
  return <ProductsTable />;
}
