import { Link } from "react-router-dom";

// Reusable tab bar used for both the top page-nav and the per-page section-nav
// under /store/customization. Keeps the emerald tab styling from the original
// StoreHome tab list. `items` = [{ key, label, to }], `activeKey` marks active.
const CustomizationTabs = ({ items = [], activeKey }) => {
  return (
    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 rounded-lg dark:text-gray-400 mb-5 gap-1">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <li key={item.key}>
            <Link
              to={item.to}
              className={`inline-block px-4 py-3 shadow-md rounded-md ${
                isActive
                  ? "bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white"
                  : "bg-gray-200 text-gray-800 font-medium dark:bg-gray-600 dark:text-gray-300"
              } hover:text-white hover:bg-emerald-500 focus:outline-none dark:hover:text-white dark:hover:bg-emerald-500`}
            >
              <span className="text-sm font-medium font-serif">
                {item.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default CustomizationTabs;
