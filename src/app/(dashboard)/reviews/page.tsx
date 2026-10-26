import type { Metadata } from "next";

import { ReviewsTable } from "@/components/reviews/reviews-table";

export const metadata: Metadata = {
  title: "Reviews | Bangla Bazar Admin",
};

export default function ReviewsPage() {
  return <ReviewsTable />;
}
