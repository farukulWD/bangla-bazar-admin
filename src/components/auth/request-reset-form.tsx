"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign } from "lucide-react";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/form-errors";
import {
  identifierSchema,
  type IdentifierValues,
} from "@/lib/validation/auth-schemas";
import { useForgotPasswordMutation } from "@/store/api/auth/api/authApi";
import type { PasswordResetChallenge } from "@/store/api/auth/types";

const FIELDS = ["identifier"] as const;

const RequestResetForm = ({
  onChallenge,
}: {
  onChallenge: (challenge: PasswordResetChallenge) => void;
}) => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<IdentifierValues>({
    resolver: zodResolver(identifierSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (values: IdentifierValues) => {
    setFormMessage(null);

    try {
      onChallenge(await forgotPassword(values).unwrap());
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
          <TextField
            control={form.control}
            name="identifier"
            label="Email or mobile number"
            icon={AtSign}
            autoComplete="username"
            placeholder="you@example.com or 01712345678"
          />

          <SubmitButton pending={isLoading} pendingLabel="Sending code">
            Recover password
          </SubmitButton>
        </FieldGroup>
      </Form>
    </div>
  );
};

export default RequestResetForm;
