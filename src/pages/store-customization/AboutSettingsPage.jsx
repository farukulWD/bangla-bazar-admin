import SectionPage from "./SectionPage";
import AboutUs from "@/components/store-home/AboutUs";

const aboutSections = [
  { key: "header", label: "Page Header" },
  { key: "top-content", label: "Top Content" },
  { key: "middle-content", label: "Middle Content" },
  { key: "founders", label: "Our Founders" },
];

const AboutSettingsPage = () => (
  <SectionPage pageKey="about" sections={aboutSections} Component={AboutUs} />
);

export default AboutSettingsPage;
