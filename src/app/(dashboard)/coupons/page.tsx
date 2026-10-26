import type { Metadata } from "next";

import { CouponsTable } from "@/components/coupons/coupons-table";

export const metadata: Metadata = {
  title: "Coupons | Bangla Bazar Admin",
};

export default function CouponsPage() {
  return <CouponsTable />;
}
