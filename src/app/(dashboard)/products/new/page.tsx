import type { Metadata } from "next";

import { ProductForm } from "@/components/products/product-form";

export const metadata: Metadata = {
  title: "New Product | Bangla Bazar Admin",
};

export default function NewProductPage() {
  return <ProductForm />;
}
