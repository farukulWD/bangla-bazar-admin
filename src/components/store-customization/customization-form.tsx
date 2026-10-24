"use client";

import { useState } from "react";
import { useForm, useFormState, useWatch, type Control } from "react-hook-form";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SwitchField from "@/components/form/switch-field";
import TagsField from "@/components/form/tags-field";
import TextField from "@/components/form/text-field";
import TextareaField from "@/components/form/textarea-field";
import { PageHeader } from "@/components/layout/page-header";
import NumberField from "@/components/settings/number-field";
import {
  ResetGroupButton,
  SettingsFooter,
  SettingsLoader,
  useCanEditSettings,
  useSaveSettingsGroups,
} from "@/components/settings/settings-shell";
import UploadImageField from "@/components/settings/upload-image-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api-error";
import { humanizeKey, pickDirty } from "@/lib/settings";
import type {
  Settings,
  StorefrontSection,
  StorefrontSettings,
} from "@/store/api/settings/types";

import { CustomizationTabs } from "./customization-tabs";
import {
  fieldKind,
  getCustomizationPage,
  type CustomizationPage,
  type CustomizationSection,
  type FieldKind,
} from "./pages-config";

type Values = Record<string, StorefrontSection>;

const pickSections = (storefront: StorefrontSettings, page: CustomizationPage): Values =>
  Object.fromEntries(page.sections.map(({ key }) => [key, storefront[key] ?? {}]));

const fieldLabel = (key: string, kind: FieldKind) => {
  if (kind !== "switch") return humanizeKey(key);
  const subject = key.replace(/_?status$/, "");
  return subject ? humanizeKey(subject) : "Show this page";
};

const findInvalidNumber = (values: Values, page: CustomizationPage) => {
  for (const { key: section } of page.sections) {
    for (const [key, value] of Object.entries(values[section] ?? {})) {
      if (typeof value === "number" && !Number.isFinite(value)) return `${section}.${key}`;
    }
  }
  return null;
};

export function StoreCustomization({ pageKey }: { pageKey: string }) {
  const page = getCustomizationPage(pageKey);
  if (!page) return null;

  return (
    <SettingsLoader>
      {(settings) => (
        <CustomizationForm key={page.key} page={page} storefront={settings.storefront} />
      )}
    </SettingsLoader>
  );
}

type CustomizationFormProps = {
  page: CustomizationPage;
  storefront: StorefrontSettings;
};

function CustomizationForm({ page, storefront }: CustomizationFormProps) {
  const canEdit = useCanEditSettings();
  const { save, saving } = useSaveSettingsGroups();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<Values>({ defaultValues: pickSections(storefront, page) });
  const { isDirty, dirtyFields } = useFormState({ control: form.control });

  const apply = (next: Partial<Settings>) => {
    if (next.storefront) form.reset(pickSections(next.storefront, page));
  };

  const onSubmit = async (values: Values) => {
    setFormMessage(null);
    const invalid = findInvalidNumber(values, page);
    if (invalid) {
      form.setError(invalid, { type: "validate", message: "Enter a number" });
      return;
    }

    try {
      const result = await save({
        storefront: pickDirty(values, dirtyFields),
      });
      if (result) apply(result);
    } catch (error) {
      setFormMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Store customization"
        description={page.description}
        actions={
          canEdit && (
            <ResetGroupButton
              groups={["storefront"]}
              description="This resets every customization tab, not just this one, back to the default text, images and toggles."
              onReset={apply}
            />
          )
        }
      />

      <CustomizationTabs active={page.key} />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <fieldset disabled={!canEdit || saving} className="min-w-0 space-y-6">
          {page.sections.map((section) => (
            <SectionCard
              key={section.key}
              section={section}
              fields={storefront[section.key] ?? {}}
              control={form.control}
              disabled={!canEdit}
            />
          ))}
        </fieldset>

        {canEdit && (
          <SettingsFooter
            pending={saving}
            dirty={isDirty}
            onDiscard={() => form.reset()}
          />
        )}
      </Form>
    </div>
  );
}

type SectionCardProps = {
  section: CustomizationSection;
  fields: StorefrontSection;
  control: Control<Values>;
  disabled: boolean;
};

function SectionCard({ section, fields, control, disabled }: SectionCardProps) {
  const entries = Object.entries(fields).map(([key, value]) => ({
    key,
    name: `${section.key}.${key}`,
    kind: fieldKind(section.key, key, value),
  }));
  const switches = entries.filter((entry) => entry.kind === "switch");
  const images = entries.filter((entry) => entry.kind === "image");
  const content = entries.filter((entry) => entry.kind !== "switch" && entry.kind !== "image");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && <CardDescription>{section.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-8">
        {switches.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Visibility</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {switches.map((entry) => (
                <SwitchField
                  key={entry.key}
                  control={control}
                  name={entry.name}
                  label={fieldLabel(entry.key, entry.kind)}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((entry) => (
                <UploadImageField
                  key={entry.key}
                  control={control}
                  name={entry.name}
                  label={fieldLabel(entry.key, entry.kind)}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}

        {content.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Content</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {content.map((entry) => (
                <ContentField
                  key={entry.key}
                  control={control}
                  name={entry.name}
                  label={fieldLabel(entry.key, entry.kind)}
                  kind={entry.kind}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type ContentFieldProps = {
  control: Control<Values>;
  name: string;
  label: string;
  kind: FieldKind;
  disabled: boolean;
};

function ContentField({ control, name, label, kind, disabled }: ContentFieldProps) {
  if (kind === "number") {
    return <NumberField control={control} name={name} label={label} min={0} step={1} />;
  }
  if (kind === "tags") {
    return (
      <TagsField
        control={control}
        name={name}
        label={label}
        placeholder="Type and press Enter"
        disabled={disabled}
      />
    );
  }
  if (kind === "html") {
    return <HtmlField control={control} name={name} label={label} />;
  }
  if (kind === "textarea") {
    return (
      <div className="md:col-span-2">
        <TextareaField control={control} name={name} label={label} rows={3} />
      </div>
    );
  }
  return <TextField control={control} name={name} label={label} />;
}

function HtmlField({ control, name, label }: Omit<ContentFieldProps, "kind" | "disabled">) {
  const html = useWatch({ control, name }) as unknown as string;

  return (
    <div className="space-y-3 md:col-span-2">
      <TextareaField
        control={control}
        name={name}
        label={label}
        rows={14}
        className="font-mono text-xs"
        description="HTML. Use headings, paragraphs, lists and links."
      />
      <details className="rounded-lg border">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium">Preview</summary>
        <div
          className="space-y-3 border-t px-4 py-3 text-sm [&_a]:underline [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: html ?? "" }}
        />
      </details>
    </div>
  );
}
