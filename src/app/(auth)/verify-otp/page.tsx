import type { Metadata } from "next";

import AuthCard from "@/components/auth/auth-card";
import VerifyResetCode from "@/components/auth/verify-reset-code";

export const metadata: Metadata = {
  title: "Verify Code | Bangla Bazar Admin",
};

export default function VerifyOtpPage() {
  return (
    <AuthCard
      title="Check your messages"
      subtitle="Enter the code we just sent you"
    >
      <VerifyResetCode />
    </AuthCard>
  );
}
