import type { CurrencyValues } from "@/lib/validation/currency-schemas";
import type {
  Currency,
  CurrencyFormat,
  CurrencyPayload,
} from "@/store/api/currency/types";

const group = (digits: string, separator: string) =>
  separator ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : digits;

export const formatCurrencyAmount = (amount: number, format: CurrencyFormat) => {
  const factor = 10 ** format.decimals;
  const rounded = Math.round((amount + Number.EPSILON) * factor) / factor;
  const [whole, fraction] = Math.abs(rounded).toFixed(format.decimals).split(".");

  const digits = fraction
    ? `${group(whole, format.thousandSeparator)}${format.decimalSeparator}${fraction}`
    : group(whole, format.thousandSeparator);

  const withSymbol =
    format.symbolPosition === "after"
      ? `${digits} ${format.symbol}`
      : `${format.symbol}${digits}`;

  return rounded < 0 ? `-${withSymbol}` : withSymbol;
};

export const formatRate = (rate: number) =>
  String(Number(rate.toPrecision(6)));

export const toPreviewFormat = (values: CurrencyValues): CurrencyFormat => ({
  symbol: values.symbol.trim() || "¤",
  symbolPosition: values.symbolPosition,
  decimals: Number(values.decimals),
  thousandSeparator: values.thousandSeparator,
  decimalSeparator: values.decimalSeparator,
});

export const toCurrencyFormValues = (currency?: Currency): CurrencyValues => ({
  code: currency?.code ?? "",
  name: currency?.name ?? "",
  symbol: currency?.symbol ?? "",
  symbolPosition: currency?.symbolPosition ?? "before",
  decimals: String(currency?.decimals ?? 2) as CurrencyValues["decimals"],
  thousandSeparator: currency?.thousandSeparator ?? ",",
  decimalSeparator: currency?.decimalSeparator ?? ".",
  rate: currency ? String(currency.rate) : "",
  status: currency?.status ?? "inactive",
});

export const toCurrencyPayload = (
  values: CurrencyValues,
  isBase: boolean,
): CurrencyPayload => ({
  code: values.code.trim().toUpperCase(),
  name: values.name.trim(),
  symbol: values.symbol.trim(),
  symbolPosition: values.symbolPosition,
  decimals: Number(values.decimals),
  thousandSeparator: values.thousandSeparator,
  decimalSeparator: values.decimalSeparator,
  ...(isBase ? {} : { rate: Number(values.rate), status: values.status }),
});
