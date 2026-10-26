import type { PaymentCallbackSource, PaymentState } from "@/store/api/payment/types";

export const PAYMENT_STATES: PaymentState[] = [
  "initiated",
  "pending",
  "paid",
  "failed",
  "cancelled",
  "mismatched",
  "expired",
];

export const PAYMENT_STATE_LABELS: Record<PaymentState, string> = {
  initiated: "Initiated",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  mismatched: "Mismatched",
  expired: "Expired",
};

export const CALLBACK_SOURCE_LABELS: Record<PaymentCallbackSource, string> = {
  success: "Success redirect",
  fail: "Fail redirect",
  cancel: "Cancel redirect",
  ipn: "IPN",
};

export const formatPaymentAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
};
