import type { Contact, ContactStatus } from "@/store/api/contact/types";

export const CONTACT_STATUSES: ContactStatus[] = ["new", "read", "replied", "archived"];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

export const replyHref = (contact: Pick<Contact, "email" | "subject">) => {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: contact.email,
    su: `Re: ${contact.subject}`,
  });
  return `https://mail.google.com/mail/?${params}`;
};
