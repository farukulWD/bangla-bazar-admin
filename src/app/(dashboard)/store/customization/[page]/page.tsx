import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreCustomization } from "@/components/store-customization/customization-form";
import {
  CUSTOMIZATION_PAGES,
  getCustomizationPage,
} from "@/components/store-customization/pages-config";

export const generateStaticParams = () =>
  CUSTOMIZATION_PAGES.map((page) => ({ page: page.key }));

export const generateMetadata = async ({
  params,
}: PageProps<"/store/customization/[page]">): Promise<Metadata> => {
  const page = getCustomizationPage((await params).page);
  return {
    title: `${page?.label ?? "Store"} Customization | Bangla Bazar Admin`,
  };
};

export default async function StoreCustomizationPage({
  params,
}: PageProps<"/store/customization/[page]">) {
  const { page } = await params;
  if (!getCustomizationPage(page)) notFound();

  return <StoreCustomization pageKey={page} />;
}
