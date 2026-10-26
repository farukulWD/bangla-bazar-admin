import { redirect } from "next/navigation";

import { DEFAULT_CUSTOMIZATION_PAGE } from "@/components/store-customization/pages-config";

export default function StoreCustomizationIndexPage() {
  redirect(`/store/customization/${DEFAULT_CUSTOMIZATION_PAGE}`);
}
