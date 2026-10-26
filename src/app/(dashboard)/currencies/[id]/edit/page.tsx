import type { Metadata } from "next";

import { EditCurrency } from "@/components/currencies/edit-currency";

export const metadata: Metadata = {
  title: "Edit Currency | Bangla Bazar Admin",
};

export default function EditCurrencyPage() {
  return <EditCurrency />;
}
