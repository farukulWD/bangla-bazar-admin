"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import PasswordField from "@/components/form/password-field";
import SubmitButton from "@/components/form/submit-button";
import { FieldGroup } from "@/components/ui/field";
import { getErrorStatus } from "@/lib/api-error";
import { applyServerErrors } from "@/lib/form-errors";
import {
  newPasswordSchema,
  type NewPasswordValues,
} from "@/lib/validation/auth-schemas";
import { useResetPasswordMutation } from "@/store/api/auth/api/authApi";

import { clearResetSession } from "./reset-session";

const FIELDS = ["password", "confirmPassword"] as const;

type ResetPasswordFormProps = {
  resetToken: string;
  onExpired: () => void;
};

const ResetPasswordForm = ({
  resetToken,
  onExpired,
}: ResetPasswordFormProps) => {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: NewPasswordValues) => {
    setFormMessage(null);

    try {
      await resetPassword({ resetToken, password: values.password }).unwrap();
      toast.success("Password changed. Please log in with your new password.");
      clearResetSession();
      router.replace("/login");
    } catch (error) {
      if (getErrorStatus(error) === 410) {
        onExpired();
        return;
      }

      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  return (
    <div className="space-y-6">
      <FormAlert message={formMessage} />

      <Form form={form} onSubmit={onSubmit}>
        <FieldGroup>
          <PasswordField
            control={form.control}
            name="password"
            label="New password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Repeat your new password"
          />

          <SubmitButton pending={isLoading} pendingLabel="Saving">
            Reset password
          </SubmitButton>
        </FieldGroup>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
