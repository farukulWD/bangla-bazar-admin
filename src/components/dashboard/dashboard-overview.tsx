"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { defaultRange } from "@/lib/dashboard";
import type { DashboardRange } from "@/store/api/dashboard/types";

import { CatalogSection } from "./catalog-section";
import { CommercialSection } from "./commercial-section";
import { DateRangePicker } from "./date-range-picker";
import { GrowthSection } from "./growth-section";
import { OperationsSection } from "./operations-section";

export function DashboardOverview() {
  const [range, setRange] = useState<DashboardRange>(defaultRange);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="How the store is doing."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />
      <OperationsSection />
      <CommercialSection range={range} />
      <GrowthSection range={range} />
      <CatalogSection />
    </div>
  );
}
