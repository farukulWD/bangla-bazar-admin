import type { Metadata } from "next";

import { OrdersTable } from "@/components/orders/orders-table";

export const metadata: Metadata = {
  title: "Orders | Bangla Bazar Admin",
};

export default function OrdersPage() {
  return <OrdersTable />;
}
