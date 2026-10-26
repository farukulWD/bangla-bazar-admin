import type { Metadata } from "next";

import { AttributeForm } from "@/components/attributes/attribute-form";

export const metadata: Metadata = {
  title: "New Attribute | Bangla Bazar Admin",
};

export default function NewAttributePage() {
  return <AttributeForm />;
}
