import type { Metadata } from "next";

import { CustomerDetail } from "@/components/customers/customer-detail";

export const metadata: Metadata = {
  title: "Customer | Bangla Bazar Admin",
};

export default function CustomerPage() {
  return <CustomerDetail />;
}
