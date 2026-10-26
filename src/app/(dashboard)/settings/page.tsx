import type { Metadata } from "next";

import { GeneralSettings } from "@/components/settings/general-settings-form";

export const metadata: Metadata = {
  title: "Settings | Bangla Bazar Admin",
};

export default function SettingsPage() {
  return <GeneralSettings />;
}
