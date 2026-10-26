"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import CategorySelectField from "@/components/form/category-select-field";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import ImageField from "@/components/form/image-field";
import SwitchField from "@/components/form/switch-field";
import TextField from "@/components/form/text-field";
import TextareaField from "@/components/form/textarea-field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/form-errors";
import { can } from "@/lib/permissions";
import {
  categorySchema,
  ROOT_PARENT,
  type CategoryValues,
} from "@/lib/validation/category-schemas";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/store/api/category/api/categoryApi";
import type { Category, CategoryPayload } from "@/store/api/category/types";

const FIELDS = [
  "name",
  "slug",
  "parentId",
  "description",
  "icon",
  "status",
] as const;

const toFormValues = (
  category: Category | undefined,
  initialParent: string | null,
): CategoryValues => ({
  name: category?.name ?? "",
  slug: category?.slug ?? "",
  parentId: category
    ? (category.parentId ?? ROOT_PARENT)
    : (initialParent ?? ROOT_PARENT),
  description: category?.description ?? "",
  icon: { file: null, url: category?.icon ?? "" },
  status: category?.status ?? "show",
});

const toFormData = (values: CategoryValues, isEdit: boolean) => {
  const payload: CategoryPayload = {
    name: values.name,
    description: values.description,
    parentId: values.parentId === ROOT_PARENT ? null : values.parentId,
    status: values.status,
  };
  if (values.slug) payload.slug = values.slug.toLowerCase();
  if (!values.icon.file && (isEdit || values.icon.url)) {
    payload.icon = values.icon.url;
  }

  const data = new FormData();
  data.append("data", JSON.stringify(payload));
  if (values.icon.file) data.append("icon", values.icon.file);
  return data;
};

const listHref = (parentId: string) =>
  parentId === ROOT_PARENT ? "/categories" : `/categories/${parentId}`;

type CategoryFormProps = {
  category?: Category;
};

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: loadingSession } = useSession();
  const isEdit = Boolean(category);
  const allowed = can(
    user,
    "category",
    isEdit ? "can_edit_category" : "can_add_category",
  );

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: toFormValues(category, searchParams.get("parent")),
  });

  const onSubmit = async (values: CategoryValues) => {
    setFormMessage(null);
    const data = toFormData(values, isEdit);

    try {
      if (category) {
        await updateCategory({ id: category._id, data }).unwrap();
        toast.success("Category updated.");
      } else {
        await createCategory(data).unwrap();
        toast.success("Category created.");
      }
      router.push(listHref(values.parentId));
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  if (!loadingSession && !allowed) {
    return (
      <AccessDenied
        message={
          isEdit
            ? "Your role does not include permission to edit categories."
            : "Your role does not include permission to add categories."
        }
      />
    );
  }

  const pending = creating || updating;
  const backHref = listHref(form.getValues("parentId"));

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? `Edit ${category?.name}` : "New category"}
        description="Categories group products in the store navigation."
        actions={
          <Button
            variant="outline"
            render={<Link href={backHref} />}
            nativeButton={false}
          >
            <ArrowLeft />
            Back
          </Button>
        }
      />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-6 md:grid-cols-2">
                <TextField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="e.g. Fresh vegetables"
                />
                <TextField
                  control={form.control}
                  name="slug"
                  label="Slug"
                  placeholder="Generated from the name"
                  description="Used in the store URL. Leave empty to generate it."
                />
                <div className="md:col-span-2">
                  <CategorySelectField
                    control={form.control}
                    name="parentId"
                    label="Parent category"
                    excludeIds={category ? [category._id] : undefined}
                  />
                </div>
                <div className="md:col-span-2">
                  <TextareaField
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Optional short description"
                    className="min-h-28"
                  />
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <ImageField control={form.control} name="icon" label="Icon" />
                <SwitchField
                  control={form.control}
                  name="status"
                  label="Show in store"
                  description="Hidden categories stay in the admin but are not listed to customers."
                  checkedValue="show"
                  uncheckedValue="hide"
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            render={<Link href={backHref} />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            {isEdit ? "Save changes" : "Create category"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
