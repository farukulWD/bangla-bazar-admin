import type { Metadata } from "next";

import ProfileView from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Profile | Bangla Bazar Admin",
};

export default function ProfilePage() {
  return <ProfileView />;
}
