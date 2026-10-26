"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { getRetryAfterSeconds } from "@/lib/form-errors";
import type { OtpChallenge } from "@/store/api/auth/types";

type UseOtpChallengeArgs<T extends OtpChallenge> = {
  challenge: T;
  onChallenge: (next: T) => void;
  resend: (identifier: string) => Promise<T>;
  onExpired: () => void;
};

export type OtpChallengeState = {
  cooldown: number;
  expiresIn: number;
  canResend: boolean;
  isResending: boolean;
  resendMessage: string | null;
  requestResend: () => Promise<void>;
  setCooldown: (seconds: number) => void;
};

const deadlineIn = (seconds: number): number => Date.now() + seconds * 1000;

const secondsUntil = (deadline: number): number =>
  Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

export const useOtpChallenge = <T extends OtpChallenge>({
  challenge,
  onChallenge,
  resend,
  onExpired,
}: UseOtpChallengeArgs<T>): OtpChallengeState => {
  const [cooldownDeadline, setCooldownDeadline] = useState(() =>
    deadlineIn(challenge.resendAfterSeconds),
  );
  const [expiryDeadline] = useState(() =>
    deadlineIn(challenge.expiresInSeconds),
  );

  const [, setTick] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const setCooldown = useCallback((seconds: number) => {
    setCooldownDeadline(deadlineIn(seconds));
  }, []);

  const requestResend = useCallback(async () => {
    setResendMessage(null);
    setIsResending(true);

    try {
      onChallenge(await resend(challenge.identifier));
    } catch (error) {
      if (getErrorStatus(error) === 410) {
        onExpired();
        return;
      }

      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter !== null) setCooldown(retryAfter);

      setResendMessage(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }, [challenge.identifier, onChallenge, onExpired, resend, setCooldown]);

  const cooldown = secondsUntil(cooldownDeadline);

  return {
    cooldown,
    expiresIn: secondsUntil(expiryDeadline),
    canResend: cooldown === 0 && !isResending,
    isResending,
    resendMessage,
    requestResend,
    setCooldown,
  };
};
