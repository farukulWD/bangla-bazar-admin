import type { Metadata } from "next";

import { AttributesTable } from "@/components/attributes/attributes-table";

export const metadata: Metadata = {
  title: "Attributes | Bangla Bazar Admin",
};

export default function AttributesPage() {
  return <AttributesTable />;
}
