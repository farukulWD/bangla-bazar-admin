"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Lock } from "lucide-react";
import { toast } from "sonner";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import PasswordField from "@/components/form/password-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/form-errors";
import { postAuthRedirect } from "@/lib/post-auth-redirect";
import { loginSchema, type LoginValues } from "@/lib/validation/auth-schemas";
import {
  useLoginMutation,
  useLogoutMutation,
} from "@/store/api/auth/api/authApi";
import { isStaff } from "@/store/api/auth/types";

import { useRedirectIfAuthenticated } from "./use-redirect-if-authenticated";

const FIELDS = ["identifier", "password"] as const;

const LoginForm = ({ next }: { next: string | null }) => {
  const [login, { isLoading }] = useLoginMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useRedirectIfAuthenticated(next);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "dorothy@gmail.com", password: "12345678" },
  });

  const onSubmit = async (values: LoginValues) => {
    setFormMessage(null);

    try {
      const { user } = await login(values).unwrap();

      if (!isStaff(user.userType)) {
        await logout()
          .unwrap()
          .catch(() => null);
        setFormMessage("This account does not have admin access.");
        return;
      }

      toast.success("Signed in");
      postAuthRedirect(next ?? "/dashboard");
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

          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="Password"
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm underline hover:text-primary hover:no-underline"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton
            pending={isLoading || isLoggingOut}
            pendingLabel="Signing in"
          >
            Login
          </SubmitButton>
        </FieldGroup>
      </Form>
    </div>
  );
};

export default LoginForm;
