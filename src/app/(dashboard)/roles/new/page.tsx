import type { Metadata } from "next";

import { RoleForm } from "@/components/roles/role-form";

export const metadata: Metadata = {
  title: "New Role | Bangla Bazar Admin",
};

export default function NewRolePage() {
  return <RoleForm />;
}
