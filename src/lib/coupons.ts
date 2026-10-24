import type { CouponValues } from "@/lib/validation/coupon-schemas";
import type { Coupon, CouponPayload } from "@/store/api/coupon/types";

export type CouponState = "active" | "scheduled" | "expired" | "hidden";

export const couponState = (coupon: Coupon, now = Date.now()): CouponState => {
  if (coupon.status === "hide") return "hidden";
  if (Date.parse(coupon.endTime) <= now) return "expired";
  if (coupon.startTime && Date.parse(coupon.startTime) > now) return "scheduled";
  return "active";
};

export const formatMoney = (value: number, currency: string) =>
  `${currency}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const formatDiscount = (
  coupon: Pick<Coupon, "discountType" | "discountValue" | "maxDiscountAmount">,
  currency: string,
) => {
  if (coupon.discountType === "fixed") {
    return formatMoney(coupon.discountValue, currency);
  }
  const cap =
    coupon.maxDiscountAmount !== undefined
      ? ` up to ${formatMoney(coupon.maxDiscountAmount, currency)}`
      : "";
  return `${coupon.discountValue}%${cap}`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateTimeInput = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromDateTimeInput = (value: string) => new Date(value).toISOString();

export const startOfDay = (day: string) =>
  day ? new Date(`${day}T00:00:00`).toISOString() : undefined;

export const endOfDay = (day: string) =>
  day ? new Date(`${day}T23:59:59.999`).toISOString() : undefined;

export const toCouponFormValues = (coupon?: Coupon): CouponValues => ({
  title: coupon?.title ?? "",
  couponCode: coupon?.couponCode ?? "",
  logo: { file: null, url: coupon?.logo ?? "" },
  discountType: coupon?.discountType ?? "percentage",
  discountValue: coupon ? String(coupon.discountValue) : "",
  maxDiscountAmount:
    coupon?.maxDiscountAmount !== undefined ? String(coupon.maxDiscountAmount) : "",
  minimumAmount: coupon ? String(coupon.minimumAmount) : "",
  startTime: toDateTimeInput(coupon?.startTime),
  endTime: toDateTimeInput(coupon?.endTime),
  status: coupon?.status ?? "show",
});

export const toCouponFormData = (values: CouponValues, isEdit: boolean) => {
  const payload: CouponPayload = {
    title: values.title,
    couponCode: values.couponCode.toUpperCase(),
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    minimumAmount: values.minimumAmount ? Number(values.minimumAmount) : 0,
    endTime: fromDateTimeInput(values.endTime),
    status: values.status,
  };
  if (values.startTime) payload.startTime = fromDateTimeInput(values.startTime);
  if (values.discountType === "percentage" && values.maxDiscountAmount) {
    payload.maxDiscountAmount = Number(values.maxDiscountAmount);
  }
  if (!values.logo.file && (isEdit || values.logo.url)) {
    payload.logo = values.logo.url;
  }

  const data = new FormData();
  data.append("data", JSON.stringify(payload));
  if (values.logo.file) data.append("logo", values.logo.file);
  return data;
};

type RawRow = Record<string, unknown>;

const read = (raw: RawRow, key: string) => {
  const value = raw[key] ?? raw[key.toLowerCase()];
  if (typeof value === "string") return value.trim();
  return value == null ? "" : String(value);
};

const asNumber = (value: string) =>
  Number.isFinite(Number(value)) ? Number(value) : value;

const asDate = (value: string) =>
  Number.isNaN(Date.parse(value)) ? value : new Date(value).toISOString();

const NUMBER_KEYS = ["discountValue", "maxDiscountAmount", "minimumAmount"] as const;
const DATE_KEYS = ["startTime", "endTime"] as const;
const TEXT_KEYS = ["title", "couponCode", "logo"] as const;
const ENUM_KEYS = ["discountType", "status"] as const;

export const toCouponRow = (raw: RawRow): CouponPayload => {
  const row: Record<string, unknown> = {};

  TEXT_KEYS.forEach((key) => {
    const value = read(raw, key);
    if (value) row[key] = value;
  });
  ENUM_KEYS.forEach((key) => {
    const value = read(raw, key).toLowerCase();
    if (value) row[key] = value;
  });
  NUMBER_KEYS.forEach((key) => {
    const value = read(raw, key);
    if (value) row[key] = asNumber(value);
  });
  DATE_KEYS.forEach((key) => {
    const value = read(raw, key);
    if (value) row[key] = asDate(value);
  });

  return row as CouponPayload;
};
