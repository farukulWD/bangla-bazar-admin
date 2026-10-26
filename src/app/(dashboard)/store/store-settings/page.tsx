import type { Metadata } from "next";

import { IntegrationSettings } from "@/components/settings/integrations-form";

export const metadata: Metadata = {
  title: "Store Settings | Bangla Bazar Admin",
};

export default function StoreSettingsPage() {
  return <IntegrationSettings />;
}
