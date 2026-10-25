"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SelectField from "@/components/form/select-field";
import SwitchField from "@/components/form/switch-field";
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
import { FieldGroup } from "@/components/ui/field";
import {
  formatCurrencyAmount,
  toCurrencyFormValues,
  toCurrencyPayload,
  toPreviewFormat,
} from "@/lib/currencies";
import { applyServerErrors } from "@/lib/form-errors";
import { can } from "@/lib/permissions";
import {
  DECIMAL_OPTIONS,
  SYMBOL_POSITIONS,
  currencySchema,
  type CurrencyValues,
} from "@/lib/validation/currency-schemas";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
} from "@/store/api/currency/api/currencyApi";
import type { Currency } from "@/store/api/currency/types";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";

const FIELDS = [
  "code",
  "name",
  "symbol",
  "symbolPosition",
  "decimals",
  "thousandSeparator",
  "decimalSeparator",
  "rate",
  "status",
] as const;

const PREVIEW_AMOUNTS = [1234567.891, 49.5, 0.75];

type CurrencyFormProps = {
  currency?: Currency;
};

export function CurrencyForm({ currency }: CurrencyFormProps) {
  const router = useRouter();
  const { user, isLoading: loadingSession } = useSession();
  const isEdit = Boolean(currency);
  const isBase = Boolean(currency?.isBase);
  const allowed = can(user, "currency", isEdit ? "can_edit_currency" : "can_add_currency");

  const { data: settings } = useGetPublicSettingsQuery();
  const baseCode = settings?.store?.currencyCode ?? "BDT";

  const [createCurrency, { isLoading: creating }] = useCreateCurrencyMutation();
  const [updateCurrency, { isLoading: updating }] = useUpdateCurrencyMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<CurrencyValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: toCurrencyFormValues(currency),
  });
  const values = useWatch({ control: form.control }) as CurrencyValues;
  const preview = toPreviewFormat(values);
  const code = values.code?.trim().toUpperCase() || "XXX";

  const onSubmit = async (submitted: CurrencyValues) => {
    setFormMessage(null);
    const data = toCurrencyPayload(submitted, isBase);

    try {
      if (currency) {
        await updateCurrency({ id: currency._id, data }).unwrap();
        toast.success("Currency updated.");
      } else {
        await createCurrency(data).unwrap();
        toast.success("Currency created.");
      }
      router.push("/currencies");
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  if (!loadingSession && !allowed) {
    return (
      <AccessDenied
        message={`Your role does not include permission to ${isEdit ? "edit" : "add"} currencies.`}
      />
    );
  }

  const pending = creating || updating;

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? `Edit ${currency?.code}` : "New currency"}
        description="How a currency is written and what it is worth against the base."
        actions={
          <Button
            variant="outline"
            render={<Link href="/currencies" />}
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
                <FieldGroup className="grid gap-6 md:grid-cols-3">
                  <TextField
                    control={form.control}
                    name="code"
                    label="Code"
                    placeholder="e.g. USD"
                    maxLength={3}
                    className="font-mono uppercase"
                  />
                  <TextField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="e.g. US Dollar"
                  />
                  <TextField
                    control={form.control}
                    name="symbol"
                    label="Symbol"
                    placeholder="e.g. $"
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format</CardTitle>
                <CardDescription>How amounts in this currency are written.</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-6 md:grid-cols-2">
                  <SelectField
                    control={form.control}
                    name="symbolPosition"
                    label="Symbol position"
                    options={[...SYMBOL_POSITIONS]}
                  />
                  <SelectField
                    control={form.control}
                    name="decimals"
                    label="Decimal places"
                    options={DECIMAL_OPTIONS}
                  />
                  <TextField
                    control={form.control}
                    name="thousandSeparator"
                    label="Thousand separator"
                    maxLength={1}
                    description="Leave empty for none."
                  />
                  <TextField
                    control={form.control}
                    name="decimalSeparator"
                    label="Decimal separator"
                    maxLength={1}
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exchange rate</CardTitle>
                <CardDescription>
                  {isBase
                    ? "This is the base currency, so its rate is always 1. Make another currency the base to change it."
                    : `How many ${code} one ${baseCode} buys.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-6 md:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="rate"
                    label={`${code} per 1 ${baseCode}`}
                    inputMode="decimal"
                    placeholder="e.g. 0.0091"
                    disabled={isBase}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>
                  {isBase
                    ? "The base currency is always active."
                    : "Inactive currencies are hidden from shoppers."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SwitchField
                  control={form.control}
                  name="status"
                  label="Active"
                  checkedValue="active"
                  uncheckedValue="inactive"
                  disabled={isBase}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 font-medium tabular-nums">
                  {PREVIEW_AMOUNTS.map((amount) => (
                    <li key={amount}>{formatCurrencyAmount(amount, preview)}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:-mb-6 md:px-6">
          <Button
            variant="outline"
            render={<Link href="/currencies" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            {isEdit ? "Save changes" : "Create currency"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
