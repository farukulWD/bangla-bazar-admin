import type { Metadata } from "next";

import { EditAttribute } from "@/components/attributes/edit-attribute";

export const metadata: Metadata = {
  title: "Edit Attribute | Bangla Bazar Admin",
};

export default function EditAttributePage() {
  return <EditAttribute />;
}
