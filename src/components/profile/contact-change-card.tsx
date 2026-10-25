"use client";

import { useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import OtpStep from "@/components/auth/otp-step";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/form-errors";
import type { OtpChallenge } from "@/store/api/auth/types";

type ContactChangeCardProps<T extends FieldValues> = {
  title: string;
  description: string;
  current?: string;
  verified: boolean;
  name: FieldPath<T>;
  label: string;
  icon: LucideIcon;
  inputType: string;
  placeholder: string;
  resolver: Resolver<T>;
  emptyValues: DefaultValues<T>;
  request: (values: T) => Promise<OtpChallenge>;
  resend: () => Promise<OtpChallenge>;
  verify: (code: string) => Promise<unknown>;
  isRequesting: boolean;
  isVerifying: boolean;
  successMessage: string;
};

const ContactChangeCard = <T extends FieldValues>({
  title,
  description,
  current,
  verified,
  name,
  label,
  icon,
  inputType,
  placeholder,
  resolver,
  emptyValues,
  request,
  resend,
  verify,
  isRequesting,
  isVerifying,
  successMessage,
}: ContactChangeCardProps<T>) => {
  const [editing, setEditing] = useState(false);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<T>({ resolver, defaultValues: emptyValues });

  const close = () => {
    setEditing(false);
    setChallenge(null);
    setFormMessage(null);
    form.reset(emptyValues);
  };

  const onSubmit = async (values: T) => {
    setFormMessage(null);

    try {
      setChallenge(await request(values));
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, [name]);
      setFormMessage(outcome.formMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {!editing && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {current ? "Change" : "Add"}
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={current ? "font-medium" : "text-muted-foreground"}>
            {current ?? "Not set"}
          </span>
          {current && (
            <Badge variant={verified ? "secondary" : "outline"}>
              {verified ? "Verified" : "Not verified"}
            </Badge>
          )}
        </div>

        {editing && !challenge && (
          <div className="space-y-6">
            <FormAlert message={formMessage} />

            <Form form={form} onSubmit={onSubmit}>
              <FieldGroup>
                <TextField
                  control={form.control}
                  name={name}
                  label={label}
                  icon={icon}
                  type={inputType}
                  placeholder={placeholder}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-10"
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <SubmitButton
                    pending={isRequesting}
                    pendingLabel="Sending code"
                    className="sm:w-auto"
                  >
                    Send code
                  </SubmitButton>
                </div>
              </FieldGroup>
            </Form>
          </div>
        )}

        {editing && challenge && (
          <div className="space-y-2">
            <OtpStep
              challenge={challenge}
              onChallenge={setChallenge}
              resend={() => resend()}
              isVerifying={isVerifying}
              submitLabel="Verify"
              onExpired={() => {
                setChallenge(null);
                setFormMessage("That code expired. Please request a new one.");
              }}
              verify={async (code) => {
                await verify(code);
                toast.success(successMessage);
                close();
              }}
            />
            <div className="text-center">
              <Button variant="link" size="sm" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactChangeCard;
