"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useResendResetCodeMutation,
  useVerifyResetCodeMutation,
} from "@/store/api/auth/api/authApi";
import type { PasswordResetChallenge } from "@/store/api/auth/types";

import AuthFooterLink from "./auth-footer-link";
import OtpStep from "./otp-step";
import {
  clearResetSession,
  useResetSession,
  writeResetSession,
} from "./reset-session";
import { useRedirectIfAuthenticated } from "./use-redirect-if-authenticated";

const VerifyResetCodeStep = ({
  initialChallenge,
}: {
  initialChallenge: PasswordResetChallenge;
}) => {
  const router = useRouter();
  const [challenge, setChallenge] = useState(initialChallenge);

  const [verifyResetCode, { isLoading: isVerifying }] =
    useVerifyResetCodeMutation();
  const [resendResetCode] = useResendResetCodeMutation();

  const startOver = (message: string) => {
    toast.error(message);
    clearResetSession();
    router.replace("/forgot-password");
  };

  return (
    <div className="space-y-6">
      <OtpStep
        challenge={challenge}
        onChallenge={(next) => {
          setChallenge(next);
          writeResetSession({ challenge: next });
        }}
        resend={(identifier) => resendResetCode({ identifier }).unwrap()}
        isVerifying={isVerifying}
        submitLabel="Verify code"
        onExpired={() => startOver("That code expired. Please start again.")}
        verify={async (code) => {
          const result = await verifyResetCode({
            identifier: challenge.identifier,
            code,
          }).unwrap();

          writeResetSession({ resetToken: result.resetToken });
          router.replace("/reset-password");
        }}
      />
      <AuthFooterLink
        prompt="Wrong account?"
        href="/forgot-password"
        label="Start over"
      />
    </div>
  );
};

const VerifyResetCode = () => {
  const router = useRouter();
  const session = useResetSession();

  useRedirectIfAuthenticated(null);

  const missing = session === null || (session && !session.challenge);

  useEffect(() => {
    if (missing) router.replace("/forgot-password");
  }, [missing, router]);

  if (!session?.challenge) return null;

  return <VerifyResetCodeStep initialChallenge={session.challenge} />;
};

export default VerifyResetCode;
