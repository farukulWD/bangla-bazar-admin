import type { Metadata } from "next";

import AuthCard from "@/components/auth/auth-card";
import ResetPassword from "@/components/auth/reset-password";

export const metadata: Metadata = {
  title: "Reset Password | Bangla Bazar Admin",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard title="New password" subtitle="Choose a new password">
      <ResetPassword />
    </AuthCard>
  );
}
