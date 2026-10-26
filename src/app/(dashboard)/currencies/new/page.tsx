import type { Metadata } from "next";

import { CurrencyForm } from "@/components/currencies/currency-form";

export const metadata: Metadata = {
  title: "New Currency | Bangla Bazar Admin",
};

export default function NewCurrencyPage() {
  return <CurrencyForm />;
}
