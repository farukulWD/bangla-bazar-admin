"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { toast } from "sonner";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/form-errors";
import {
  profileSchema,
  type ProfileValues,
} from "@/lib/validation/auth-schemas";
import { useUpdateMeMutation } from "@/store/api/auth/api/authApi";
import type { SessionUser } from "@/store/api/auth/types";

const FIELDS = ["name"] as const;

const ProfileDetailsForm = ({ user }: { user: SessionUser }) => {
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user.name },
  });

  const onSubmit = async (values: ProfileValues) => {
    setFormMessage(null);

    try {
      await updateMe(values).unwrap();
      toast.success("Profile updated.");
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>The name shown across the admin panel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormAlert message={formMessage} />

        <Form form={form} onSubmit={onSubmit}>
          <FieldGroup>
            <TextField
              control={form.control}
              name="name"
              label="Full name"
              icon={User}
              autoComplete="name"
              placeholder="Your name"
            />

            <SubmitButton
              pending={isLoading}
              pendingLabel="Saving"
              className="w-full sm:ml-auto sm:w-auto"
            >
              Save changes
            </SubmitButton>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileDetailsForm;
