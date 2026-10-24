"use client";

import { useRouter } from "next/navigation";

import AuthFooterLink from "./auth-footer-link";
import RequestResetForm from "./request-reset-form";
import { writeResetSession } from "./reset-session";
import { useRedirectIfAuthenticated } from "./use-redirect-if-authenticated";

const ForgotPasswordForm = () => {
  const router = useRouter();

  useRedirectIfAuthenticated(null);

  return (
    <div className="space-y-6">
      <RequestResetForm
        onChallenge={(challenge) => {
          writeResetSession({ challenge });
          router.push("/verify-otp");
        }}
      />
      <AuthFooterLink prompt="Remembered it?" href="/login" label="Login" />
    </div>
  );
};

export default ForgotPasswordForm;
