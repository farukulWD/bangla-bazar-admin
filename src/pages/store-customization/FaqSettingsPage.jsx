import SectionPage from "./SectionPage";
import Faq from "@/components/store-home/Faq";

const faqSections = [
  { key: "header", label: "Page Header" },
  { key: "left-column", label: "Left Column" },
  { key: "right-column", label: "FAQ Items" },
];

const FaqSettingsPage = () => (
  <SectionPage pageKey="faq" sections={faqSections} Component={Faq} />
);

export default FaqSettingsPage;
