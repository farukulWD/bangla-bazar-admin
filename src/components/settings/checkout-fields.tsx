"use client";

import type { Control } from "react-hook-form";

import SwitchField from "@/components/form/switch-field";
import TextField from "@/components/form/text-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import type { GeneralSettingsValues } from "@/lib/validation/settings-schemas";
import {
  PAYMENT_METHODS,
  SHIPPING_OPTION_KEYS,
} from "@/store/api/settings/types";

import NumberField from "./number-field";

const SHIPPING_TITLES = { standard: "Standard", express: "Express" } as const;
const PAYMENT_TITLES = { cod: "Cash on delivery", sslcommerz: "SSLCommerz" } as const;

type CheckoutFieldsProps = {
  control: Control<GeneralSettingsValues>;
  currency: string;
};

export function CheckoutFields({ control, currency }: CheckoutFieldsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Delivery options</CardTitle>
          <CardDescription>
            What shoppers can pick at checkout and what each one costs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {SHIPPING_OPTION_KEYS.map((key, index) => (
            <div key={key} className="space-y-4">
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium">{SHIPPING_TITLES[key]}</h3>
                <SwitchField
                  control={control}
                  name={`checkout.shipping.${key}.enabled`}
                  label="Offered"
                />
              </div>
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <TextField
                  control={control}
                  name={`checkout.shipping.${key}.label`}
                  label="Label"
                />
                <TextField
                  control={control}
                  name={`checkout.shipping.${key}.note`}
                  label="Note"
                />
                <NumberField
                  control={control}
                  name={`checkout.shipping.${key}.fee`}
                  label={`Fee (${currency})`}
                  min={0}
                  step={0.01}
                />
                <NumberField
                  control={control}
                  name={`checkout.shipping.${key}.etaDays`}
                  label="Estimated days"
                  min={0}
                  step={1}
                />
              </FieldGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment methods</CardTitle>
          <CardDescription>
            Turned-off methods are hidden at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {PAYMENT_METHODS.map((key, index) => (
            <div key={key} className="space-y-4">
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium">{PAYMENT_TITLES[key]}</h3>
                <SwitchField
                  control={control}
                  name={`checkout.paymentMethods.${key}.enabled`}
                  label="Offered"
                />
              </div>
              <TextField
                control={control}
                name={`checkout.paymentMethods.${key}.label`}
                label="Label shown to shoppers"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order rules</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <NumberField
              control={control}
              name="checkout.freeDeliveryOver"
              label={`Free delivery over (${currency})`}
              description="Standard delivery is free once the subtotal reaches this."
              min={0}
              step={0.01}
            />
            <NumberField
              control={control}
              name="checkout.lowStockThreshold"
              label="Low stock threshold"
              description="Products at or below this stock are flagged."
              min={0}
              step={1}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </>
  );
}
