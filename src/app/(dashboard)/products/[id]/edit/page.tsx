import type { Metadata } from "next";

import { EditProduct } from "@/components/products/edit-product";

export const metadata: Metadata = {
  title: "Edit Product | Bangla Bazar Admin",
};

export default function EditProductPage() {
  return <EditProduct />;
}
