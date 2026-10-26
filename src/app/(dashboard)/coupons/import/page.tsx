import type { Metadata } from "next";

import { BulkImport } from "@/components/import/bulk-import";

export const metadata: Metadata = {
  title: "Import Coupons | Bangla Bazar Admin",
};

export default function ImportCouponsPage() {
  return <BulkImport kind="coupon" />;
}
