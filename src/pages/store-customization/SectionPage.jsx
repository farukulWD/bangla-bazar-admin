import AnimatedContent from "@/components/common/AnimatedContent";
import CustomizationTabs from "@/components/store-home/CustomizationTabs";
import useQuery from "@/hooks/useQuery";
import { useStoreCustomization } from "@/context/StoreCustomizationContext";

// Renders a customization page that has multiple sections shown as tabs.
// The active section comes from ?section=<key> (defaults to the first). The
// underlying store-home component receives the shared form via {...store} and an
// `activeSection` prop so it renders only that section's block.
const SectionPage = ({ pageKey, sections, Component }) => {
  const store = useStoreCustomization();
  const query = useQuery();
  const activeSection = query.get("section") || sections[0].key;

  const items = sections.map((s) => ({
    key: s.key,
    label: s.label,
    to: `/store/customization/${pageKey}?section=${s.key}`,
  }));

  return (
    <>
      <CustomizationTabs items={items} activeKey={activeSection} />
      <AnimatedContent>
        <div className="sm:container w-full md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={store.handleSubmit(store.onSubmit)}>
            <Component {...store} activeSection={activeSection} />
          </form>
        </div>
      </AnimatedContent>
    </>
  );
};

export default SectionPage;
