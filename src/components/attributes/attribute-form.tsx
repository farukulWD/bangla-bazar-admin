"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SelectField from "@/components/form/select-field";
import SwitchField from "@/components/form/switch-field";
import TextField from "@/components/form/text-field";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { applyServerErrors } from "@/lib/form-errors";
import { can } from "@/lib/permissions";
import {
  ATTRIBUTE_OPTIONS,
  ATTRIBUTE_TYPES,
  attributeSchema,
  type AttributeValues,
} from "@/lib/validation/attribute-schemas";
import {
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
} from "@/store/api/attribute/api/attributeApi";
import type { Attribute, AttributePayload } from "@/store/api/attribute/types";
import { useSession } from "@/store/api/auth/hooks/use-session";

const FIELDS = ["name", "slug", "option", "type", "status", "values"] as const;

const toFormValues = (attribute?: Attribute): AttributeValues => ({
  name: attribute?.name ?? "",
  slug: attribute?.slug ?? "",
  option: attribute?.option ?? "dropdown",
  type: attribute?.type ?? "attribute",
  status: attribute?.status ?? "show",
  values: [],
});

type AttributeFormProps = {
  attribute?: Attribute;
};

export function AttributeForm({ attribute }: AttributeFormProps) {
  const router = useRouter();
  const { user, isLoading: loadingSession } = useSession();
  const isEdit = Boolean(attribute);
  const allowed = can(
    user,
    "attribute",
    isEdit ? "can_edit_attribute" : "can_add_attribute",
  );

  const [createAttribute, { isLoading: creating }] = useCreateAttributeMutation();
  const [updateAttribute, { isLoading: updating }] = useUpdateAttributeMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const form = useForm<AttributeValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: toFormValues(attribute),
  });
  const values = useFieldArray({ control: form.control, name: "values" });

  const addDraft = () => {
    const names = draft
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    const taken = new Set(
      form.getValues("values").map((value) => value.name.toLowerCase()),
    );
    const duplicates: string[] = [];

    names.forEach((name) => {
      const key = name.toLowerCase();
      if (taken.has(key)) {
        duplicates.push(name);
        return;
      }
      taken.add(key);
      values.append({ name });
    });

    setDraft("");
    setDraftError(
      duplicates.length ? `Already added: ${duplicates.join(", ")}` : null,
    );
  };

  const onSubmit = async (formValues: AttributeValues) => {
    setFormMessage(null);

    const payload: AttributePayload = {
      name: formValues.name,
      option: formValues.option,
      type: formValues.type,
      status: formValues.status,
    };
    if (formValues.slug) payload.slug = formValues.slug.toLowerCase();

    try {
      if (attribute) {
        await updateAttribute({ id: attribute._id, data: payload }).unwrap();
        toast.success("Attribute updated.");
        router.push(`/attributes/${attribute._id}`);
      } else {
        const created = await createAttribute({
          ...payload,
          values: formValues.values
            .map((value) => ({ name: value.name.trim() }))
            .filter((value) => value.name),
        }).unwrap();
        toast.success("Attribute created.");
        router.push(`/attributes/${created._id}`);
      }
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
            ? "Your role does not include permission to edit attributes."
            : "Your role does not include permission to add attributes."
        }
      />
    );
  }

  const pending = creating || updating;
  const backHref = attribute ? `/attributes/${attribute._id}` : "/attributes";

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? `Edit ${attribute?.name}` : "New attribute"}
        description="An attribute is a product option, such as size or colour."
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
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-6 md:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="e.g. Size"
                  />
                  <TextField
                    control={form.control}
                    name="slug"
                    label="Slug"
                    placeholder="Generated from the name"
                    description="Leave empty to generate it."
                  />
                  <SelectField
                    control={form.control}
                    name="option"
                    label="Input"
                    options={[...ATTRIBUTE_OPTIONS]}
                    description="How shoppers choose a value."
                  />
                  <SelectField
                    control={form.control}
                    name="type"
                    label="Type"
                    options={[...ATTRIBUTE_TYPES]}
                    description="Extras are add-ons, not variant options."
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            {!isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Values</CardTitle>
                  <CardDescription>
                    The choices for this attribute. You can add more later.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Field data-invalid={Boolean(draftError)}>
                    <FieldLabel htmlFor="attribute-value-draft">Add values</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id="attribute-value-draft"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addDraft();
                          }
                        }}
                        placeholder="e.g. Small, Medium, Large"
                        className="h-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10"
                        onClick={addDraft}
                      >
                        <Plus />
                        Add
                      </Button>
                    </div>
                    <FieldDescription>
                      Press Enter to add. Separate several with commas.
                    </FieldDescription>
                    <FieldError
                      errors={[
                        draftError
                          ? { message: draftError }
                          : form.formState.errors.values?.root,
                      ]}
                    />
                  </Field>

                  {values.fields.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {values.fields.map((field, index) => (
                        <Badge
                          key={field.id}
                          variant="secondary"
                          className="h-7 gap-1 pr-1 text-sm"
                        >
                          {field.name}
                          <button
                            type="button"
                            aria-label={`Remove ${field.name}`}
                            className="rounded-sm p-0.5 hover:bg-background"
                            onClick={() => values.remove(index)}
                          >
                            <X className="size-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>
                Hidden attributes stay in the admin but are not offered to
                shoppers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SwitchField
                control={form.control}
                name="status"
                label="Show in store"
                checkedValue="show"
                uncheckedValue="hide"
              />
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
            {isEdit ? "Save changes" : "Create attribute"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
