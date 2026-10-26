import type { Metadata } from "next";

import { PaymentDetail } from "@/components/payments/payment-detail";

export const metadata: Metadata = {
  title: "Payment | Bangla Bazar Admin",
};

export default function PaymentPage() {
  return <PaymentDetail />;
}
