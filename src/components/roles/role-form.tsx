"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import TextField from "@/components/form/text-field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { applyServerErrors } from "@/lib/form-errors";
import { isSuperAdmin } from "@/lib/permissions";
import { roleSchema, type RoleValues } from "@/lib/validation/role-schemas";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useCreateRoleMutation,
  useGetPermissionCatalogueQuery,
  useUpdateRoleMutation,
} from "@/store/api/role/api/roleApi";
import type { Role, RoleModule } from "@/store/api/role/types";

import { PermissionMatrix } from "./permission-matrix";

const FIELDS = ["name", "description", "isActive"] as const;

const toFormValues = (role?: Role): RoleValues => ({
  name: role?.name ?? "",
  description: role?.description ?? "",
  isActive: role?.isActive ?? true,
  permissions: Object.fromEntries(
    (role?.modules ?? []).map((entry) => [entry.module, { ...entry.permissions }])
  ),
});

const toModules = (permissions: RoleValues["permissions"]): RoleModule[] =>
  Object.entries(permissions)
    .map(([module, map]) => ({
      module,
      permissions: Object.fromEntries(
        Object.entries(map).filter(([, granted]) => granted)
      ),
    }))
    .filter((entry) => Object.keys(entry.permissions).length > 0);

type RoleFormProps = {
  role?: Role;
};

export function RoleForm({ role }: RoleFormProps) {
  const router = useRouter();
  const { user, isLoading: loadingSession } = useSession();
  const readOnly = !loadingSession && !isSuperAdmin(user);
  const isEdit = Boolean(role);

  const { data: catalogue, isLoading: loadingCatalogue } =
    useGetPermissionCatalogueQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: toFormValues(role),
  });

  const { field: description } = useController({
    control: form.control,
    name: "description",
  });
  const { field: isActive } = useController({
    control: form.control,
    name: "isActive",
  });
  const { field: permissions } = useController({
    control: form.control,
    name: "permissions",
  });

  const onSubmit = async (values: RoleValues) => {
    setFormMessage(null);

    const payload = {
      name: values.name,
      description: values.description,
      modules: toModules(values.permissions),
    };

    try {
      if (role) {
        await updateRole({
          id: role._id,
          data: { ...payload, isActive: values.isActive },
        }).unwrap();
        toast.success("Role updated.");
      } else {
        await createRole(payload).unwrap();
        toast.success("Role created.");
      }
      router.push("/roles");
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  if (readOnly && !isEdit) {
    return (
      <AccessDenied message="Only a super admin can create roles and set their permissions." />
    );
  }

  const pending = creating || updating;
  const title = readOnly ? "View role" : isEdit ? "Edit role" : "New role";

  return (
    <div className="w-full">
      <PageHeader
        title={title}
        description={
          readOnly
            ? "Only a super admin can change roles and permissions."
            : "Name the role and tick the permissions it grants."
        }
        actions={
          <Button
            variant="outline"
            render={<Link href="/roles" />}
            nativeButton={false}
          >
            <ArrowLeft />
            Back to roles
          </Button>
        }
      />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <TextField
                control={form.control}
                name="name"
                label="Role name"
                placeholder="e.g. Order manager"
                disabled={readOnly}
              />

              <Field>
                <FieldLabel htmlFor="role-description">Description</FieldLabel>
                <Textarea
                  id="role-description"
                  {...description}
                  placeholder="What is this role for?"
                  disabled={readOnly}
                />
              </Field>

              {isEdit && (
                <Field orientation="horizontal">
                  <Switch
                    id="role-active"
                    checked={isActive.value}
                    onCheckedChange={isActive.onChange}
                    disabled={readOnly}
                  />
                  <FieldLabel htmlFor="role-active">
                    Active — staff with an inactive role lose all its permissions
                  </FieldLabel>
                </Field>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Staff with this role can do only what is ticked here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCatalogue ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full" />
                ))}
              </div>
            ) : (
              <PermissionMatrix
                catalogue={catalogue ?? []}
                value={permissions.value}
                onChange={permissions.onChange}
                disabled={readOnly}
              />
            )}
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              render={<Link href="/roles" />}
              nativeButton={false}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 aria-hidden className="animate-spin" />}
              {isEdit ? "Save changes" : "Create role"}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}
