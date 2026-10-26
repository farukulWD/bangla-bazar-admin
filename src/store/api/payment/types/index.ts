import type { OrderStatus, PaymentMethod, PaymentStatus as OrderPaymentStatus } from "@/store/api/order/types";
import type { ID, ISODate } from "@/types/api";

export type PaymentState =
  | "initiated"
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "mismatched"
  | "expired";

export type PaymentProvider = "sslcommerz";

export type PaymentCallbackSource = "success" | "fail" | "cancel" | "ipn";

export type PaymentCallback = {
  source: PaymentCallbackSource;
  at: ISODate;
  gatewayStatus: string;
  valId: string;
  ip: string;
};

export type PaymentOrder = {
  _id: ID;
  invoice: number;
  total: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
};

export type PaymentUser = {
  _id: ID;
  name: string;
  email: string;
  phone: string;
};

export type Payment = {
  id: ID;
  order: PaymentOrder | null;
  user: PaymentUser | null;
  orderId: ID;
  invoice: number;
  provider: PaymentProvider;
  tranId: string;
  amount: number;
  currency: string;
  status: PaymentState;
  valId: string;
  bankTranId: string;
  cardType: string;
  cardIssuer: string;
  riskLevel: string;
  riskTitle: string;
  validatedAmount: number | null;
  storeAmount: number | null;
  settledBy: PaymentCallbackSource | null;
  duplicate: boolean;
  failedReason: string;
  callbacks: PaymentCallback[];
  initiatedAt: ISODate;
  verifiedAt: ISODate | null;
  paidAt: ISODate | null;
  failedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type PaymentListQuery = {
  searchTerm?: string;
  status?: PaymentState;
  orderId?: ID;
  userId?: ID;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
};
