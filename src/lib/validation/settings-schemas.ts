import { z } from "zod";

import type { Settings } from "@/store/api/settings/types";

const optionalEmail = z.union([
  z.literal(""),
  z.email("That email is not valid"),
]);

const amount = z
  .number({ error: "Enter a number" })
  .min(0, "Cannot be negative");

const wholeNumber = z
  .int({ error: "Enter a whole number" })
  .min(0, "Cannot be negative");

const shippingOptionSchema = z.object({
  label: z.string().trim().min(1, "A delivery option needs a label"),
  note: z.string().trim(),
  fee: amount,
  etaDays: wholeNumber,
  enabled: z.boolean(),
});

const paymentMethodSchema = z.object({
  label: z.string().trim().min(1, "A payment method needs a label"),
  enabled: z.boolean(),
});

export const generalSettingsSchema = z.object({
  store: z.object({
    shopName: z.string().trim().min(1, "The shop needs a name"),
    companyName: z.string().trim(),
    logo: z.string(),
    logoDark: z.string(),
    favicon: z.string(),
    address: z.string().trim(),
    city: z.string().trim(),
    postCode: z.string().trim(),
    country: z.string().trim(),
    contact: z.string().trim(),
    email: optionalEmail,
    fromEmail: optionalEmail,
    website: z.string().trim(),
    vatNumber: z.string().trim(),
    timeZone: z.string().trim().min(1, "Choose a time zone"),
    dateFormat: z.string().trim().min(1, "Choose a date format"),
    receiptSize: z.string().trim(),
    invoiceFooterNote: z.string().trim(),
    numberOfImagePerProduct: z
      .int({ error: "Enter a whole number" })
      .min(1, "At least 1 image")
      .max(20, "At most 20 images"),
    emailToCustomer: z.boolean(),
  }),
  checkout: z.object({
    shipping: z.object({
      standard: shippingOptionSchema,
      express: shippingOptionSchema,
    }),
    paymentMethods: z.object({
      cod: paymentMethodSchema,
      sslcommerz: paymentMethodSchema,
    }),
    freeDeliveryOver: amount,
    lowStockThreshold: wholeNumber,
  }),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

const EDITABLE_STORE_KEYS = generalSettingsSchema.shape.store.keyof().options;

export const toGeneralSettingsValues = ({
  store,
  checkout,
}: Pick<Settings, "store" | "checkout">): GeneralSettingsValues => ({
  store: Object.fromEntries(
    EDITABLE_STORE_KEYS.map((key) => [key, store[key]]),
  ) as GeneralSettingsValues["store"],
  checkout,
});
