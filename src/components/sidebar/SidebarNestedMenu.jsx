import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoRemoveSharp,
} from "react-icons/io5";

// Second-level collapsible submenu (e.g. Online Store ▸ Store Customization ▸ pages).
// Rendered by SidebarSubMenu when a child entry itself carries a `routes` array.
const SidebarNestedMenu = ({ child }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const basePath = child.routes?.[0]?.path.split("/").slice(0, 3).join("/");
  const [open, setOpen] = useState(
    basePath ? pathname.startsWith(basePath) : false
  );

  return (
    <li className="relative">
      <button
        className="inline-flex items-center justify-between focus:outline-none w-full py-1 font-serif text-sm text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
      >
        <span className="inline-flex items-center">
          <span className="text-xs text-gray-500 pr-1">
            <IoRemoveSharp />
          </span>
          <span>{t(`${child.name}`)}</span>
          <span className="pl-2">
            {open ? <IoChevronDownOutline /> : <IoChevronForwardOutline />}
          </span>
        </span>
      </button>
      {open && (
        <ul className="pl-4" aria-label="submenu">
          {child.routes.map((grandChild, i) => (
            <li key={i + 1}>
              <NavLink
                to={grandChild.path}
                className="flex items-center font-serif py-1 text-sm text-gray-600 hover:text-emerald-600 cursor-pointer dark:text-gray-400 dark:hover:text-gray-200"
                activeStyle={{ color: "#0d9e6d" }}
                rel="noreferrer"
              >
                <span className="text-xs text-gray-500 pr-1">
                  <IoRemoveSharp />
                </span>
                <span>{t(`${grandChild.name}`)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarNestedMenu;
