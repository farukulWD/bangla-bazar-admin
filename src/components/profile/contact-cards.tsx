"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone } from "lucide-react";

import {
  changeEmailSchema,
  changePhoneSchema,
  type ChangeEmailValues,
  type ChangePhoneValues,
} from "@/lib/validation/auth-schemas";
import {
  useRequestEmailChangeMutation,
  useRequestPhoneChangeMutation,
  useResendEmailChangeCodeMutation,
  useResendPhoneChangeCodeMutation,
  useVerifyEmailChangeMutation,
  useVerifyPhoneChangeMutation,
} from "@/store/api/auth/api/authApi";
import type { SessionUser } from "@/store/api/auth/types";

import ContactChangeCard from "./contact-change-card";

export const EmailChangeCard = ({ user }: { user: SessionUser }) => {
  const [requestChange, { isLoading: isRequesting }] =
    useRequestEmailChangeMutation();
  const [resendCode] = useResendEmailChangeCodeMutation();
  const [verifyChange, { isLoading: isVerifying }] =
    useVerifyEmailChangeMutation();

  return (
    <ContactChangeCard<ChangeEmailValues>
      title="Email address"
      description="We'll send a code to the new address to confirm it."
      current={user.email}
      verified={user.isEmailVerify}
      name="email"
      label="New email address"
      icon={Mail}
      inputType="email"
      placeholder="you@example.com"
      resolver={zodResolver(changeEmailSchema)}
      emptyValues={{ email: "" }}
      request={(values) => requestChange(values).unwrap()}
      resend={() => resendCode().unwrap()}
      verify={(code) => verifyChange({ code }).unwrap()}
      isRequesting={isRequesting}
      isVerifying={isVerifying}
      successMessage="Email address updated."
    />
  );
};

export const PhoneChangeCard = ({ user }: { user: SessionUser }) => {
  const [requestChange, { isLoading: isRequesting }] =
    useRequestPhoneChangeMutation();
  const [resendCode] = useResendPhoneChangeCodeMutation();
  const [verifyChange, { isLoading: isVerifying }] =
    useVerifyPhoneChangeMutation();

  return (
    <ContactChangeCard<ChangePhoneValues>
      title="Mobile number"
      description="We'll text a code to the new number to confirm it."
      current={user.phone}
      verified={user.isPhoneVerify}
      name="phone"
      label="New mobile number"
      icon={Phone}
      inputType="tel"
      placeholder="01712345678"
      resolver={zodResolver(changePhoneSchema)}
      emptyValues={{ phone: "" }}
      request={(values) => requestChange(values).unwrap()}
      resend={() => resendCode().unwrap()}
      verify={(code) => verifyChange({ code }).unwrap()}
      isRequesting={isRequesting}
      isVerifying={isVerifying}
      successMessage="Mobile number updated."
    />
  );
};
