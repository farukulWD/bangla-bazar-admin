import type { ID, ISODate } from "@/types/api";

export type ContactStatus = "new" | "read" | "replied" | "archived";

export type Contact = {
  _id: ID;
  user: ID | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type ContactListQuery = {
  searchTerm?: string;
  status?: ContactStatus;
  page?: number;
  limit?: number;
  sort?: string;
};
