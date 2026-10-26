import { z } from "zod";

export const SYMBOL_POSITIONS = [
  { label: "Before amount (৳100)", value: "before" },
  { label: "After amount (100 ৳)", value: "after" },
] as const;

export const DECIMAL_OPTIONS = ["0", "1", "2", "3", "4"].map((value) => ({
  label: value,
  value,
}));

export const rateSchema = z
  .string()
  .trim()
  .min(1, "Exchange rate is required")
  .refine(
    (value) => Number.isFinite(Number(value)) && Number(value) > 0,
    "An exchange rate must be greater than 0",
  );

const separator = (label: string) =>
  z.string().max(1, `${label} must be a single character`);

export const currencySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  name: z
    .string()
    .trim()
    .min(1, "Currency name is required")
    .max(60, "Currency name is too long"),
  symbol: z
    .string()
    .trim()
    .min(1, "A currency symbol is required")
    .max(8, "That symbol is too long"),
  symbolPosition: z.enum(["before", "after"]),
  decimals: z.enum(["0", "1", "2", "3", "4"]),
  thousandSeparator: separator("A thousand separator"),
  decimalSeparator: separator("A decimal separator"),
  rate: rateSchema,
  status: z.enum(["active", "inactive"]),
});

export type CurrencyValues = z.infer<typeof currencySchema>;
