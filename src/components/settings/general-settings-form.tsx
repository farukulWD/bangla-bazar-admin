"use client";

import { useMemo, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SelectField, { type SelectOption } from "@/components/form/select-field";
import SwitchField from "@/components/form/switch-field";
import TextField from "@/components/form/text-field";
import TextareaField from "@/components/form/textarea-field";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/api-error";
import { pickDirty } from "@/lib/settings";
import {
  generalSettingsSchema,
  toGeneralSettingsValues,
  type GeneralSettingsValues,
} from "@/lib/validation/settings-schemas";
import type { Settings } from "@/store/api/settings/types";

import { CheckoutFields } from "./checkout-fields";
import NumberField from "./number-field";
import {
  ResetGroupButton,
  SettingsFooter,
  SettingsLoader,
  useCanEditSettings,
  useSaveSettingsGroups,
} from "./settings-shell";
import UploadImageField from "./upload-image-field";

const DATE_FORMATS = ["MMM D, YYYY", "D MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const RECEIPT_SIZES = [
  { label: "57 mm thermal", value: "57-mm" },
  { label: "80 mm thermal", value: "80-mm" },
  { label: "A4", value: "a4" },
];

const withCurrent = (options: SelectOption[], current: string) =>
  !current || options.some((option) => option.value === current)
    ? options
    : [{ label: current, value: current }, ...options];

export function GeneralSettings() {
  return (
    <SettingsLoader>
      {(settings) => <GeneralSettingsForm settings={settings} />}
    </SettingsLoader>
  );
}

function GeneralSettingsForm({ settings }: { settings: Settings }) {
  const canEdit = useCanEditSettings();
  const { save, saving } = useSaveSettingsGroups();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const { currencySymbol, currencyCode, decimalPlaces } = settings.store;

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: toGeneralSettingsValues(settings),
  });
  const { isDirty, dirtyFields } = useFormState({ control: form.control });

  const timeZones = useMemo(
    () =>
      withCurrent(
        Intl.supportedValuesOf("timeZone").map((zone) => ({ label: zone, value: zone })),
        settings.store.timeZone,
      ),
    [settings.store.timeZone],
  );
  const dateFormats = withCurrent(
    DATE_FORMATS.map((format) => ({ label: format, value: format })),
    settings.store.dateFormat,
  );
  const receiptSizes = withCurrent(RECEIPT_SIZES, settings.store.receiptSize);

  const onSubmit = async (values: GeneralSettingsValues) => {
    setFormMessage(null);
    const patch = pickDirty(values, dirtyFields);

    try {
      const saved = await save({
        store: patch.store as Record<string, unknown> | undefined,
        checkout: patch.checkout as Record<string, unknown> | undefined,
      });
      if (saved) {
        form.reset(toGeneralSettingsValues({ ...settings, ...values, ...saved } as Settings));
      }
    } catch (error) {
      setFormMessage(getErrorMessage(error));
    }
  };

  const onReset = (results: Partial<Settings>) =>
    form.reset(toGeneralSettingsValues({ ...settings, ...results }));

  return (
    <div className="w-full">
      <PageHeader
        title="Settings"
        description="Business details, invoices, delivery and payment options."
        actions={
          canEdit && (
            <ResetGroupButton
              groups={["store", "checkout"]}
              description="Every field on this page goes back to its default value. Store customization and integrations are not affected."
              onReset={onReset}
            />
          )
        }
      />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <fieldset disabled={!canEdit || saving} className="min-w-0 space-y-6">
          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Business</CardTitle>
                  <CardDescription>
                    Shown on invoices, emails and the storefront footer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <TextField control={form.control} name="store.shopName" label="Shop name" />
                    <TextField control={form.control} name="store.companyName" label="Company name" />
                    <TextField control={form.control} name="store.email" label="Email" type="email" />
                    <TextField control={form.control} name="store.contact" label="Phone" type="tel" />
                    <TextField control={form.control} name="store.website" label="Website" type="url" />
                    <TextField control={form.control} name="store.vatNumber" label="VAT / BIN number" />
                    <div className="md:col-span-2">
                      <TextField control={form.control} name="store.address" label="Address" />
                    </div>
                    <TextField control={form.control} name="store.city" label="City" />
                    <TextField control={form.control} name="store.postCode" label="Post code" />
                    <TextField control={form.control} name="store.country" label="Country" />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localization</CardTitle>
                  <CardDescription>
                    Currency is managed by the base currency and cannot be edited here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      control={form.control}
                      name="store.timeZone"
                      label="Time zone"
                      options={timeZones}
                      disabled={!canEdit}
                    />
                    <SelectField
                      control={form.control}
                      name="store.dateFormat"
                      label="Date format"
                      options={dateFormats}
                      disabled={!canEdit}
                    />
                    <dl className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/30 p-4 text-sm md:col-span-2">
                      <div>
                        <dt className="text-muted-foreground">Currency</dt>
                        <dd className="font-medium">{currencyCode}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Symbol</dt>
                        <dd className="font-medium">{currencySymbol}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Decimals</dt>
                        <dd className="font-medium">{decimalPlaces}</dd>
                      </div>
                    </dl>
                  </FieldGroup>
                </CardContent>
              </Card>

              <CheckoutFields control={form.control} currency={currencySymbol} />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-6">
                    <UploadImageField control={form.control} name="store.logo" label="Logo" disabled={!canEdit} />
                    <UploadImageField
                      control={form.control}
                      name="store.logoDark"
                      label="Logo for dark backgrounds"
                      disabled={!canEdit}
                    />
                    <UploadImageField control={form.control} name="store.favicon" label="Favicon" disabled={!canEdit} />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoices & email</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-4">
                    <SelectField
                      control={form.control}
                      name="store.receiptSize"
                      label="Receipt size"
                      options={receiptSizes}
                      disabled={!canEdit}
                    />
                    <TextareaField
                      control={form.control}
                      name="store.invoiceFooterNote"
                      label="Invoice footer note"
                      rows={3}
                    />
                    <TextField
                      control={form.control}
                      name="store.fromEmail"
                      label="Send emails from"
                      type="email"
                    />
                    <SwitchField
                      control={form.control}
                      name="store.emailToCustomer"
                      label="Email customers about their orders"
                      disabled={!canEdit}
                    />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <NumberField
                    control={form.control}
                    name="store.numberOfImagePerProduct"
                    label="Images per product"
                    description="Between 1 and 20."
                    min={1}
                    max={20}
                    step={1}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
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
