import type { Metadata } from "next";

import { ContactsTable } from "@/components/contacts/contacts-table";

export const metadata: Metadata = {
  title: "Messages | Bangla Bazar Admin",
};

export default function ContactsPage() {
  return <ContactsTable />;
}
