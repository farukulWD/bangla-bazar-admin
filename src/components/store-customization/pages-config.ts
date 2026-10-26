export type CustomizationSection = {
  key: string;
  title: string;
  description?: string;
};

export type CustomizationPage = {
  key: string;
  label: string;
  description: string;
  sections: CustomizationSection[];
};

export const CUSTOMIZATION_PAGES: CustomizationPage[] = [
  {
    key: "home",
    label: "Home",
    description: "Header, slider, home page blocks and footer.",
    sections: [
      { key: "navbar", title: "Header", description: "Menu links, labels and the help line." },
      { key: "slider", title: "Slider", description: "Hero slides at the top of the home page." },
      { key: "home", title: "Home page", description: "Which blocks show and what they say." },
      { key: "footer", title: "Footer" },
    ],
  },
  {
    key: "product",
    label: "Product page",
    description: "The info box beside every product.",
    sections: [{ key: "slug", title: "Product page" }],
  },
  {
    key: "about",
    label: "About us",
    description: "The about page content and team.",
    sections: [{ key: "about_us", title: "About us" }],
  },
  {
    key: "privacy",
    label: "Privacy & terms",
    description: "Legal pages. Content is HTML.",
    sections: [
      { key: "privacy_policy", title: "Privacy policy" },
      { key: "term_and_condition", title: "Terms & conditions" },
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Questions and answers on the FAQ page.",
    sections: [{ key: "faq", title: "FAQ" }],
  },
  {
    key: "offers",
    label: "Offers",
    description: "The offers page and which coupons it lists.",
    sections: [{ key: "offers", title: "Offers" }],
  },
  {
    key: "contact",
    label: "Contact us",
    description: "Contact boxes and the message form.",
    sections: [{ key: "contact_us", title: "Contact us" }],
  },
  {
    key: "checkout",
    label: "Checkout",
    description: "Labels shown on the checkout page.",
    sections: [{ key: "checkout", title: "Checkout labels" }],
  },
  {
    key: "dashboard",
    label: "Customer dashboard",
    description: "Labels in the shopper's account area.",
    sections: [{ key: "dashboard", title: "Dashboard labels" }],
  },
  {
    key: "seo",
    label: "SEO",
    description: "Search and social sharing metadata.",
    sections: [{ key: "seo", title: "SEO" }],
  },
];

export const DEFAULT_CUSTOMIZATION_PAGE = CUSTOMIZATION_PAGES[0].key;

export const getCustomizationPage = (key: string) =>
  CUSTOMIZATION_PAGES.find((page) => page.key === key);

export const HTML_FIELDS = new Set([
  "privacy_policy.description",
  "term_and_condition.description",
]);

export type FieldKind = "switch" | "image" | "tags" | "number" | "textarea" | "html" | "text";

const IMAGE_KEY = /(_img|_bg|^logo|^favicon)$/;

export const fieldKind = (section: string, key: string, value: unknown): FieldKind => {
  if (typeof value === "boolean") return "switch";
  if (Array.isArray(value)) return "tags";
  if (typeof value === "number") return "number";
  if (HTML_FIELDS.has(`${section}.${key}`)) return "html";
  if (IMAGE_KEY.test(key)) return "image";
  if (key.includes("description") || (typeof value === "string" && value.length > 120)) {
    return "textarea";
  }
  return "text";
};
