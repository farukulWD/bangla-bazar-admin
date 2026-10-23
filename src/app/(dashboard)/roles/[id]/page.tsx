import type { Metadata } from "next";

import { EditRole } from "@/components/roles/edit-role";

export const metadata: Metadata = {
  title: "Edit Role | Bangla Bazar Admin",
};

export default function EditRolePage() {
  return <EditRole />;
}
