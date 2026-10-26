import type { Metadata } from "next";

import { CurrenciesTable } from "@/components/currencies/currencies-table";

export const metadata: Metadata = {
  title: "Currencies | Bangla Bazar Admin",
};

export default function CurrenciesPage() {
  return <CurrenciesTable />;
}
