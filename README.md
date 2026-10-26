# Bangla Bazar Admin

The admin panel for Bangla Bazar. Staff use it to run the store: products, orders, payments,
customers, coupons, staff roles and store settings.

It talks to the [Bangla Bazar server](../bangla-bazar-server) API.

### Features

- **Dashboard:** sales, orders and trends shown as charts.
- **Catalog:** products (with variants and images), categories, attributes, bulk CSV import.
- **Orders and payments:** order list and details, status changes, cancel, invoices, CSV export, payment records.
- **People:** customers, staff users, roles and permissions.
- **Marketing:** coupons, reviews, contact messages.
- **Store:** store settings, page customization, currencies.
- **Notifications:** live in-app notifications with toasts.
- **Auth:** login, forgot password, OTP verification, reset password.
- **Dark mode** with a theme toggle.

---

## Tech stack and why we chose it

| Technology | What it does here | Why we chose it |
| --- | --- | --- |
| **Next.js 16** (App Router) | Pages and routing | File-based routes keep each admin page in its own folder. Same framework as the store, so code and skills carry over. |
| **React 19** + React Compiler | UI | The compiler handles memoization, so big tables and forms stay fast without manual tuning. |
| **TypeScript** | Language | Catches mistakes before the code runs and keeps API types in sync. |
| **Tailwind CSS 4** | Styling | Styles sit next to the markup. No separate CSS files to keep in sync. |
| **shadcn/ui** + Base UI | Components | Accessible tables, dialogs and forms that live in our code, so we can change them freely. |
| **Redux Toolkit Query** | API data | Fetching, caching and auto-refresh after edits through cache tags. |
| **Axios** | HTTP | Adds the auth token and retries on an expired session in one place. |
| **React Hook Form** + **Zod** | Forms | Admin forms are large. RHF keeps them fast, Zod keeps rules readable and matched to the server. |
| **Socket.IO client** | Live notifications | New orders and alerts show up instantly, no page refresh. |
| **Recharts** | Charts | Simple React charts for the dashboard. |
| **PapaParse** | CSV | Reads CSV files in the browser for bulk product import. |
| **date-fns** + React Day Picker | Dates | Light date helpers and date-range filters. |
| **next-themes** | Theming | Light and dark mode with no flash on load. |
| **Sonner** / **Lucide** | Toasts and icons | Simple toasts, clean consistent icons. |

---

## Architecture

```
 Staff (browser)
        │
        ▼
 ┌──────────────────── Next.js admin ────────────────────┐
 │ proxy.ts → no session cookie? redirect to /login      │
 │        ▼                                              │
 │ (dashboard) pages → hide what the user can't access   │
 │        ▼                                              │
 │ RTK Query hooks → axios (token + refresh on 401)      │
 │                                                       │
 │ Socket.IO client → live notifications                 │
 └───────────────────────────────────────────────────────┘
        │  REST /api/v1          │  WebSocket
        ▼                        ▼
            Bangla Bazar server
```

### Folder structure

```
src/
├── app/
│   ├── (auth)/        Login, forgot password, OTP, reset password
│   └── (dashboard)/   One folder per admin section (products, orders, roles...)
├── components/        UI grouped by feature
│   ├── ui/            Base components (button, table, dialog...)
│   ├── form/          Shared form fields
│   └── layout/        Sidebar, header, theme toggle
├── config/nav.ts      Sidebar menu
├── hooks/             Reusable hooks (socket, debounce, job polling)
├── lib/               Helpers, permissions, Zod schemas in validation/
├── store/api/         API calls, one folder per feature
├── providers/         App-wide React providers
├── types/             Shared TypeScript types
└── proxy.ts           Redirects logged-out users to /login
```

---

## How it works

- **Logging in.** The access token is kept in `localStorage`, plus a small session cookie
  so `proxy.ts` can redirect logged-out users before the page loads. The refresh token is an
  httpOnly cookie set by the server. On a 401 the app refreshes once and retries. If that
  fails, the user is logged out.
- **Permissions.** Each staff user gets a permission map from their role. `can(user, module,
  permission)` in `src/lib/permissions.ts` decides what menus, pages and buttons show. A
  superAdmin sees everything. The server checks the same permissions again, so hiding a
  button is for convenience, not security.
- **Live notifications.** After login the app opens a Socket.IO connection with the access
  token. New notifications show a toast and refresh the inbox.
- **Bulk import and export.** Product CSV files are read in the browser with PapaParse and
  sent to the server. Product export runs as a background job on the server, and the admin
  polls it until the file is ready.
- **API responses.** Every response looks like `{ statusCode, success, message, data, pagination? }`.
  The client unwraps it, so hooks return `data` directly.

### Rules we follow

1. No `fetch` or `axios` inside components. Use RTK Query hooks.
2. One API file per feature in `src/store/api/<feature>/`, built with `baseApi.injectEndpoints`.
3. Register cache tags in `tagTypes.ts` before using them, so lists refresh after edits.
4. Handle errors the same way everywhere: `.unwrap()` in a try/catch, then show field errors on the form and a toast for the rest.
5. Validate forms with Zod schemas in `src/lib/validation/`, matching the server's limits.
6. Form Save and Cancel buttons stay sticky at the bottom of the page.
7. Use `components/ui` before writing new components.

---

## Deployment

Any Next.js host works (Vercel is the simplest). Set these environment variables:

| Name | What it is |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Server API root, e.g. `https://your-api-domain/api/v1` |
| `NEXT_PUBLIC_API_SOCKET_URL` | Server address for Socket.IO (no `/api/v1`) |
| `NEXT_PUBLIC_STORE_DOMAIN` | Public store URL, used for the store link in the sidebar |

The server only accepts requests from addresses in its `CLIENT_URLS` setting, so the admin
domain must be listed there.
