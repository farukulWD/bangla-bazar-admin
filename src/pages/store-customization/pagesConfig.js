// Single source of truth for the /store/customization pages.
// - key: route segment + page-nav active key
// - labelKey: i18n key for the tab label
// - Component: what renders inside the page. For single-section pages this is the
//   original store-home component (rendered with {...store} spread). Multi-section
//   pages (home, about, contact, faq, privacy) get a section-tab page component in
//   later milestones, swapped in here.
import HomeSettingsPage from "./HomeSettingsPage";
import SinglePage from "@/components/store-home/SinglePage";
import AboutSettingsPage from "./AboutSettingsPage";
import PrivacySettingsPage from "./PrivacySettingsPage";
import FaqSettingsPage from "./FaqSettingsPage";
import Offer from "@/components/store-home/Offer";
import ContactSettingsPage from "./ContactSettingsPage";
import Checkout from "@/components/store-home/Checkout";
import DashboardSetting from "@/components/store-home/DashboardSetting";
import SeoSetting from "@/components/settings/SeoSetting";

export const customizationPages = [
  { key: "home", labelKey: "HomeSettings", Component: HomeSettingsPage, custom: true },
  { key: "single", labelKey: "SingleSetting", Component: SinglePage },
  { key: "about", labelKey: "AboutUsSetting", Component: AboutSettingsPage, custom: true },
  { key: "privacy", labelKey: "PrivacyTCSetting", Component: PrivacySettingsPage, custom: true },
  { key: "faq", labelKey: "FAQSetting", Component: FaqSettingsPage, custom: true },
  { key: "offers", labelKey: "OffersStting", Component: Offer },
  { key: "contact", labelKey: "ContactUsStting", Component: ContactSettingsPage, custom: true },
  { key: "checkout", labelKey: "Checkout", Component: Checkout },
  { key: "dashboard", labelKey: "DashboardSetting", Component: DashboardSetting },
  { key: "seo", labelKey: "SeoSetting", Component: SeoSetting },
];

export const DEFAULT_PAGE = "home";

export const getPage = (key) =>
  customizationPages.find((p) => p.key === key) || customizationPages[0];
