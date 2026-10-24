"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import PasswordField from "@/components/form/password-field";
import SelectField, { type SelectOption } from "@/components/form/select-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { FieldGroup } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { applyServerErrors } from "@/lib/form-errors";
import {
  createStaffUserSchema,
  NO_ROLE,
  updateStaffUserSchema,
  type CreateStaffUserValues,
  type UpdateStaffUserValues,
} from "@/lib/validation/user-schemas";
import { UserType } from "@/store/api/auth/types";
import {
  useCreateStaffUserMutation,
  useUpdateStaffUserMutation,
} from "@/store/api/user/api/userApi";
import type { StaffUser } from "@/store/api/user/types";

const CREATE_FIELDS = ["name", "email", "phone", "password", "role"] as const;
const UPDATE_FIELDS = ["name", "role", "status"] as const;

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const toRoleId = (value: string) => (value === NO_ROLE ? null : value);

type FormProps = {
  roleOptions: SelectOption[];
  onDone: () => void;
};

const CreateUserForm = ({ roleOptions, onDone }: FormProps) => {
  const [createUser, { isLoading }] = useCreateStaffUserMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<CreateStaffUserValues>({
    resolver: zodResolver(createStaffUserSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", role: NO_ROLE },
  });

  const onSubmit = async (values: CreateStaffUserValues) => {
    setFormMessage(null);

    try {
      await createUser({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
        role: toRoleId(values.role),
      }).unwrap();
      toast.success("Staff user created.");
      onDone();
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, CREATE_FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <FormAlert message={formMessage} />
      <FieldGroup>
        <TextField
          control={form.control}
          name="name"
          label="Full name"
          icon={User}
          placeholder="Full name"
        />
        <TextField
          control={form.control}
          name="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="off"
          placeholder="name@example.com"
        />
        <TextField
          control={form.control}
          name="phone"
          label="Phone"
          icon={Phone}
          type="tel"
          placeholder="01XXXXXXXXX"
          description="Email or phone is required."
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <SelectField
          control={form.control}
          name="role"
          label="Role"
          options={roleOptions}
          placeholder="Select a role"
        />
        <SubmitButton pending={isLoading} pendingLabel="Creating">
          Create user
        </SubmitButton>
      </FieldGroup>
    </Form>
  );
};

const EditUserForm = ({
  user,
  roleOptions,
  onDone,
}: FormProps & { user: StaffUser }) => {
  const [updateUser, { isLoading }] = useUpdateStaffUserMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const superAdmin = user.userType === UserType.SuperAdmin;

  const form = useForm<UpdateStaffUserValues>({
    resolver: zodResolver(updateStaffUserSchema),
    defaultValues: {
      name: user.name,
      role: user.role?._id ?? NO_ROLE,
      status: user.status,
    },
  });

  const onSubmit = async (values: UpdateStaffUserValues) => {
    setFormMessage(null);

    try {
      await updateUser({
        id: user._id,
        data: superAdmin
          ? { name: values.name, status: values.status }
          : {
              name: values.name,
              role: toRoleId(values.role),
              status: values.status,
            },
      }).unwrap();
      toast.success("User updated.");
      onDone();
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, UPDATE_FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <FormAlert message={formMessage} />
      <FieldGroup>
        <TextField
          control={form.control}
          name="name"
          label="Full name"
          icon={User}
          placeholder="Full name"
        />
        <SelectField
          control={form.control}
          name="role"
          label="Role"
          options={roleOptions}
          disabled={superAdmin}
          description={
            superAdmin
              ? "A super admin has every permission and cannot hold a role."
              : undefined
          }
        />
        <SelectField
          control={form.control}
          name="status"
          label="Status"
          options={STATUS_OPTIONS}
        />
        <SubmitButton pending={isLoading} pendingLabel="Saving">
          Save changes
        </SubmitButton>
      </FieldGroup>
    </Form>
  );
};

type UserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: StaffUser | null;
  roleOptions: SelectOption[];
};

export function UserSheet({
  open,
  onOpenChange,
  user,
  roleOptions,
}: UserSheetProps) {
  const options = [{ label: "No role", value: NO_ROLE }, ...roleOptions];
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{user ? "Edit user" : "New staff user"}</SheetTitle>
          <SheetDescription>
            {user
              ? "Change the name, role or status of this account."
              : "The user signs in to the admin panel with these credentials."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {open &&
            (user ? (
              <EditUserForm
                key={user._id}
                user={user}
                roleOptions={options}
                onDone={close}
              />
            ) : (
              <CreateUserForm roleOptions={options} onDone={close} />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
