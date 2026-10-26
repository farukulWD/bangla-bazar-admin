"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import OtpField from "@/components/form/otp-field";
import SubmitButton from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { applyServerErrors } from "@/lib/form-errors";
import { otpSchema, type OtpValues } from "@/lib/validation/auth-schemas";
import type { OtpChallenge } from "@/store/api/auth/types";

import { useOtpChallenge } from "./use-otp-challenge";

const FIELDS = ["code"] as const;

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
};

type OtpStepProps<T extends OtpChallenge> = {
  challenge: T;
  onChallenge: (next: T) => void;
  resend: (identifier: string) => Promise<T>;
  verify: (code: string) => Promise<void>;
  isVerifying: boolean;
  onExpired: () => void;
  submitLabel: string;
};

const OtpStepInstance = <T extends OtpChallenge>({
  challenge,
  onChallenge,
  resend,
  verify,
  isVerifying,
  onExpired,
  submitLabel,
}: OtpStepProps<T>) => {
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const otp = useOtpChallenge({ challenge, onChallenge, resend, onExpired });

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: challenge.devCode ?? "" },
  });

  const onSubmit = async (values: OtpValues) => {
    setFormMessage(null);

    try {
      await verify(values.code);
    } catch (error) {
      if (getErrorStatus(error) === 410) {
        otp.setCooldown(0);
        form.reset({ code: "" });
        setFormMessage(getErrorMessage(error));
        return;
      }

      const outcome = applyServerErrors(error, form.setError, FIELDS);
      if (outcome.retryAfterSeconds !== null) {
        otp.setCooldown(outcome.retryAfterSeconds);
        form.reset({ code: "" });
      }

      setFormMessage(outcome.formMessage);
    }
  };

  const alert = formMessage ?? otp.resendMessage;

  return (
    <div className="space-y-6">
      <FormAlert message={alert} />

      <p className="text-center text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">
          {challenge.targetMasked}
        </span>
        .
      </p>

      <Form form={form} onSubmit={onSubmit}>
        <FieldGroup>
          <OtpField
            control={form.control}
            name="code"
            label="Verification code"
            disabled={isVerifying}
            onComplete={() => void form.handleSubmit(onSubmit)()}
            description={
              process.env.NODE_ENV === "development" && challenge.devCode ? (
                <>
                  Dev code:{" "}
                  <code className="font-mono">{challenge.devCode}</code>
                </>
              ) : otp.expiresIn > 0 ? (
                `This code expires in ${formatDuration(otp.expiresIn)}.`
              ) : (
                "This code has expired — request a new one."
              )
            }
          />

          <SubmitButton pending={isVerifying} pendingLabel="Verifying">
            {submitLabel}
          </SubmitButton>
        </FieldGroup>
      </Form>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!otp.canResend}
          onClick={otp.requestResend}
        >
          {otp.isResending
            ? "Sending a new code"
            : otp.canResend
              ? "Resend code"
              : `Resend in ${formatDuration(otp.cooldown)}`}
        </Button>
      </div>
    </div>
  );
};

const OtpStep = <T extends OtpChallenge>({
  onChallenge,
  ...props
}: OtpStepProps<T>) => {
  const [issue, setIssue] = useState(0);

  return (
    <OtpStepInstance
      key={issue}
      {...props}
      onChallenge={(next) => {
        setIssue((value) => value + 1);
        onChallenge(next);
      }}
    />
  );
};

export default OtpStep;
