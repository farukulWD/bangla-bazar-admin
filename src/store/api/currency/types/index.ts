import type { ID, ISODate } from "@/types/api";

export type CurrencyStatus = "active" | "inactive";
export type SymbolPosition = "before" | "after";

export type Currency = {
  _id: ID;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: SymbolPosition;
  decimals: number;
  thousandSeparator: string;
  decimalSeparator: string;
  rate: number;
  isBase: boolean;
  status: CurrencyStatus;
  rateUpdatedAt: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type CurrencyFormat = Pick<
  Currency,
  | "symbol"
  | "symbolPosition"
  | "decimals"
  | "thousandSeparator"
  | "decimalSeparator"
>;

export type CurrencyPayload = {
  code?: string;
  name?: string;
  symbol?: string;
  symbolPosition?: SymbolPosition;
  decimals?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  rate?: number;
  status?: CurrencyStatus;
};

export type CurrencyListQuery = {
  searchTerm?: string;
  status?: CurrencyStatus;
  page?: number;
  limit?: number;
  sort?: string;
};
