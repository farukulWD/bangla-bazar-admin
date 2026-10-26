import type { Metadata } from "next";

import { ContactDetail } from "@/components/contacts/contact-detail";

export const metadata: Metadata = {
  title: "Message | Bangla Bazar Admin",
};

export default function ContactPage() {
  return <ContactDetail />;
}
