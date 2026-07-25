import SectionPage from "./SectionPage";
import PrivacyPolicy from "@/components/store-home/PrivacyPolicy";

const privacySections = [
  { key: "privacy-policy", label: "Privacy Policy" },
  { key: "terms-conditions", label: "Terms & Conditions" },
];

const PrivacySettingsPage = () => (
  <SectionPage
    pageKey="privacy"
    sections={privacySections}
    Component={PrivacyPolicy}
  />
);

export default PrivacySettingsPage;
