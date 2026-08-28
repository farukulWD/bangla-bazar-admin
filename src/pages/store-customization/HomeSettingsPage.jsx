import SectionPage from "./SectionPage";
import HomePage from "@/components/store-home/HomePage";

// Section keys must match the `activeSection === "<key>"` guards wrapping each
// block inside HomePage.jsx.
export const homeSections = [
  { key: "header-menu", label: "Header & Menu" },
  { key: "slider", label: "Main Slider" },
  { key: "coupon", label: "Coupon Box" },
  { key: "promotion", label: "Promotion Banner" },
  { key: "featured", label: "Featured Categories" },
  { key: "popular", label: "Popular Products" },
  { key: "quick-delivery", label: "Quick Delivery" },
  { key: "latest-discounted", label: "Latest Discounted" },
  { key: "daily-needs", label: "Daily Needs" },
  { key: "feature-promo", label: "Feature Promo" },
  { key: "footer", label: "Footer" },
];

const HomeSettingsPage = () => (
  <SectionPage pageKey="home" sections={homeSections} Component={HomePage} />
);

export default HomeSettingsPage;
