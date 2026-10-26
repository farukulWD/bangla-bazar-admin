export type PublicSettings = {
  store?: {
    numberOfImagePerProduct?: number;
    currencySymbol?: string;
    currencyCode?: string;
  };
};

export const SETTINGS_GROUPS = [
  "store",
  "checkout",
  "integrations",
  "storefront",
] as const;

export type SettingsGroup = (typeof SETTINGS_GROUPS)[number];

export const SHIPPING_OPTION_KEYS = ["standard", "express"] as const;
export const PAYMENT_METHODS = ["cod", "sslcommerz"] as const;
export const OAUTH_PROVIDERS = ["google", "facebook", "github"] as const;

export type ShippingKey = (typeof SHIPPING_OPTION_KEYS)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export type StoreSettings = {
  shopName: string;
  companyName: string;
  logo: string;
  logoDark: string;
  favicon: string;
  address: string;
  city: string;
  postCode: string;
  country: string;
  contact: string;
  email: string;
  fromEmail: string;
  website: string;
  vatNumber: string;
  currencySymbol: string;
  currencyCode: string;
  timeZone: string;
  dateFormat: string;
  decimalPlaces: number;
  receiptSize: string;
  invoiceFooterNote: string;
  numberOfImagePerProduct: number;
  emailToCustomer: boolean;
};

export type ShippingOptionSetting = {
  label: string;
  note: string;
  fee: number;
  etaDays: number;
  enabled: boolean;
};

export type PaymentMethodSetting = {
  label: string;
  enabled: boolean;
};

export type CheckoutSettings = {
  shipping: Record<ShippingKey, ShippingOptionSetting>;
  paymentMethods: Record<PaymentMethod, PaymentMethodSetting>;
  freeDeliveryOver: number;
  lowStockThreshold: number;
};

export type MaskedSecret = {
  isSet: boolean;
  hint: string;
};

export type OAuthProviderSetting<Secret = MaskedSecret> = {
  enabled: boolean;
  clientId: string;
  clientSecret: Secret;
};

export type SocialLinks = {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  whatsapp: string;
  pinterest: string;
};

export type IntegrationSettings<Secret = MaskedSecret> = {
  analytics: {
    googleAnalyticsId: string;
    googleAnalyticsEnabled: boolean;
    fbPixelId: string;
    fbPixelEnabled: boolean;
  };
  socialLogin: Record<OAuthProvider, OAuthProviderSetting<Secret>>;
  chat: {
    tawkEnabled: boolean;
    tawkPropertyId: string;
    tawkWidgetId: string;
  };
  social: SocialLinks;
};

export type StorefrontValue = string | number | boolean | string[];

export type StorefrontSection = Record<string, StorefrontValue>;

export type StorefrontSettings = Record<string, StorefrontSection>;

export type Settings = {
  store: StoreSettings;
  checkout: CheckoutSettings;
  integrations: IntegrationSettings;
  storefront: StorefrontSettings;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
