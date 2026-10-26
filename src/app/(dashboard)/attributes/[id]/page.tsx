import type { Metadata } from "next";

import { AttributeValues } from "@/components/attributes/attribute-values";

export const metadata: Metadata = {
  title: "Attribute | Bangla Bazar Admin",
};

export default function AttributeValuesPage() {
  return <AttributeValues />;
}
