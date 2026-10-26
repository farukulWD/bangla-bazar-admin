import type { Metadata } from "next";

import { OrderInvoice } from "@/components/orders/order-invoice";

export const metadata: Metadata = {
  title: "Invoice | Bangla Bazar Admin",
};

export default function OrderInvoicePage() {
  return <OrderInvoice />;
}
