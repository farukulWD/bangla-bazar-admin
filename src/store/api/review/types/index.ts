import type { ID, ISODate } from "@/types/api";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewProduct = {
  _id: ID;
  title: string;
  slug: string;
  images: string[];
  isDeleted: boolean;
};

export type ReviewUser = {
  _id: ID;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
};

export type ReviewReply = {
  text: string;
  repliedBy: ID | { _id: ID; name: string };
  repliedAt: ISODate;
};

export type Review = {
  _id: ID;
  product: ReviewProduct | null;
  user: ReviewUser | null;
  order: ID;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  rejectionReason: string;
  reply: ReviewReply | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type ReviewListQuery = {
  searchTerm?: string;
  status?: ReviewStatus | "";
  rating?: string;
  product?: ID;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "-createdAt" | "rating" | "-rating";
};

export type ReviewStatusInput = {
  status: ReviewStatus;
  rejectionReason?: string;
};
