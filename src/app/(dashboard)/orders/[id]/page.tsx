import type { Metadata } from "next";

import { OrderDetail } from "@/components/orders/order-detail";

export const metadata: Metadata = {
  title: "Order | Bangla Bazar Admin",
};

export default function OrderPage() {
  return <OrderDetail />;
}
