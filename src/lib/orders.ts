import type {
  Order,
  OrderCurrency,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/store/api/order/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "refunded", "failed"];

export const PAYMENT_METHODS: PaymentMethod[] = ["cod", "sslcommerz"];

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  sslcommerz: "SSLCommerz",
};

export const SHIPPING_LABELS: Record<Order["shippingOption"], string> = {
  standard: "Standard delivery",
  express: "Express delivery",
};

export const nextStatuses = (order: Pick<Order, "status">) =>
  ORDER_STATUS_FLOW[order.status].filter((status) => status !== "cancelled");

export const isCancellable = (order: Pick<Order, "status">) =>
  order.status !== "delivered" && order.status !== "cancelled";

export const formatOrderMoney = (value: number, currency: OrderCurrency) => {
  const [whole, fraction] = Math.abs(value).toFixed(currency.decimals).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
  const amount = fraction ? `${grouped}${currency.decimalSeparator}${fraction}` : grouped;
  const signed = value < 0 ? "-" : "";

  return currency.symbolPosition === "after"
    ? `${signed}${amount} ${currency.symbol}`
    : `${signed}${currency.symbol}${amount}`;
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const itemCount = (order: Pick<Order, "items">) =>
  order.items.reduce((sum, item) => sum + item.qty, 0);

export const formatAddress = (address: Order["address"]) =>
  [address.address, address.area, address.city, address.zipCode, address.country]
    .filter(Boolean)
    .join(", ");
