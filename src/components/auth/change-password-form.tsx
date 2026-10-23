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
import { applyServerErrors } from "@/lib/form-errors";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/validation/auth-schemas";
import { useChangePasswordMutation } from "@/store/api/auth/api/authApi";

const FIELDS = ["currentPassword", "newPassword", "confirmPassword"] as const;

const ChangePasswordForm = () => {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    setFormMessage(null);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      toast.success("Password changed. Please log in with your new password.");
      router.replace("/login");
    } catch (error) {
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
            name="currentPassword"
            label="Current password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="Current password"
          />

          <PasswordField
            control={form.control}
            name="newPassword"
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
            Change password
          </SubmitButton>
        </FieldGroup>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
