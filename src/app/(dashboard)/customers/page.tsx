import type { Metadata } from "next";

import { CustomersTable } from "@/components/customers/customers-table";

export const metadata: Metadata = {
  title: "Customers | Bangla Bazar Admin",
};

export default function CustomersPage() {
  return <CustomersTable />;
}
