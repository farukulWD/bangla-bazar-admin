import type { Metadata } from "next";

import { PaymentsTable } from "@/components/payments/payments-table";

export const metadata: Metadata = {
  title: "Payments | Bangla Bazar Admin",
};

export default function PaymentsPage() {
  return <PaymentsTable />;
}
