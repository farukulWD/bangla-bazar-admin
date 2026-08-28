import SectionPage from "./SectionPage";
import ContactUs from "@/components/store-home/ContactUs";

const contactSections = [
  { key: "header", label: "Page Header" },
  { key: "info-boxes", label: "Info Boxes" },
  { key: "left-column", label: "Left Column" },
  { key: "form", label: "Contact Form" },
];

const ContactSettingsPage = () => (
  <SectionPage
    pageKey="contact"
    sections={contactSections}
    Component={ContactUs}
  />
);

export default ContactSettingsPage;
