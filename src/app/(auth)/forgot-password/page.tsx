import type { Metadata } from "next";

import AuthCard from "@/components/auth/auth-card";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Bangla Bazar Admin",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password"
      subtitle="We'll send a code to your email or phone"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
