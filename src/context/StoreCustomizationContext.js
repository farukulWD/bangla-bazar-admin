import { createContext, useContext } from "react";

// Holds the single shared useStoreHomeSubmit() instance so every page and
// section-tab under /store/customization reads from ONE form + ONE monolithic
// save. Keeping a single instance is what preserves save integrity across pages
// (react-hook-form retains unmounted field values with shouldUnregister:false).
export const StoreCustomizationContext = createContext(null);

export const useStoreCustomization = () => {
  const ctx = useContext(StoreCustomizationContext);
  if (!ctx) {
    throw new Error(
      "useStoreCustomization must be used within <StoreCustomizationContext.Provider>"
    );
  }
  return ctx;
};
