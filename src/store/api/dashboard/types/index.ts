export type Granularity = "day" | "week";

export type DashboardRange = { from: string; to: string };

export type RangeMeta = DashboardRange & { granularity: Granularity };

export type Scalar = { value: number; previous: number };

export type SeriesPoint = { bucket: string; value: number };

export type Series = { granularity: Granularity; points: SeriesPoint[] };

export type Category = { key: string; label: string; value: number };

export type TopProduct = Category & { quantity: number };

export type CommercialResponse = {
  range: RangeMeta;
  revenue: Scalar;
  orders: Scalar;
  averageOrderValue: Scalar;
  receivables: number;
  cancelledOrders: Scalar;
  revenueSeries: Series;
  orderSeries: Series;
  paymentMix: Category[];
  statusFunnel: Category[];
  topProducts: TopProduct[];
  ordersByCity: Category[];
};

export type OperationsTile = {
  key: string;
  label: string;
  count: number;
  href: string;
  tone: "neutral" | "warn";
};

export type OperationsResponse = { tiles: OperationsTile[] };

export type GrowthResponse = {
  range: RangeMeta;
  signups: Scalar;
  signupSeries: Series;
  activeSplit: Category[];
  verifiedSplit: Category[];
};

export type CatalogResponse = {
  totalProducts: number;
  statusSplit: Category[];
  stockSplit: Category[];
  productsPerCategory: Category[];
};
