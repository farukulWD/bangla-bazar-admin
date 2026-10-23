"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ResetPasswordForm from "./reset-password-form";
import { clearResetSession, useResetSession } from "./reset-session";
import { useRedirectIfAuthenticated } from "./use-redirect-if-authenticated";

const ResetPassword = () => {
  const router = useRouter();
  const session = useResetSession();

  useRedirectIfAuthenticated(null);

  const missing = session === null || (session && !session.resetToken);

  useEffect(() => {
    if (missing) router.replace("/forgot-password");
  }, [missing, router]);

  if (!session?.resetToken) return null;

  return (
    <ResetPasswordForm
      resetToken={session.resetToken}
      onExpired={() => {
        toast.error("That reset expired. Please start again.");
        clearResetSession();
        router.replace("/forgot-password");
      }}
    />
  );
};

export default ResetPassword;
