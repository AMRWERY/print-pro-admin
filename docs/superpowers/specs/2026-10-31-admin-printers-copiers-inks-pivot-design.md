# Admin dashboard pivot: Printers, Photocopiers and Inks & Toner

Date: 2026-10-31
Status: Draft for review
Companion: the storefront pivot (`user/docs/superpowers/specs/2026-10-23-printers-copiers-inks-pivot-design.md`). The business decisions below are the same.

## 1. Goal

The admin dashboard (`D:\Studying\Not Done Projects\PrintPro\admin`) manages a store that sells **Printers, Photocopiers and Inks & Toner**, not photography and optics equipment. Every screen, label, demo record and API response must fit that business, and the admin catalog must match the storefront's catalog.

## 2. Confirmed decisions

| Decision | Choice |
| --- | --- |
| Scope | Full pivot of all admin pages and demo data. |
| Categories | `printers`, `copiers`, `inks-toner`. Same as the storefront. |
| Products | The same 31 sample products as the storefront (same IDs, names, SKUs, prices), plus generated variants so the register keeps its large size. |
| Unused storefront copies | Deleted: `app/data/{catalog,cameras,home,account,account-orders,printing,product-details}.ts`, `server/api/catalog.get.ts`, `server/api/products/[id].get.ts`, `server/api/account/orders.get.ts`, and any type or component that only they use. They are in git. |
| Demo customers | Offices, schools and print shops in Cairo, Giza and other Egyptian and Gulf cities. Currency stays EGP. |

Out of scope: a real backend, real data, changing the layout or visual design, moving hard-coded strings into i18n files (the locale JSON files stay as they are unless they contain the old wording).

## 3. Constraints

- Nuxt 4, Tailwind 3, `@nuxtjs/i18n`. `design.md` stays the design contract. No new visual language.
- Admin layout, tables, inspectors, dialogs, exports and permissions behave as they do now. Only content, labels and domain values change.
- Demo data stays deterministic (fixed "today", stable IDs), so screens look the same between reloads.

## 4. Success criteria

1. `node scripts/check-vocabulary.mjs` reports 0 matches in `app/` and `server/` for the banned list: camera, lens, lenses, lighting, audio, tripod, medium format, colorimeter, baryta, cine, Hasselblad, photograph*, atelier, cleanroom, escrow, vault, metrology, requisition, spectro*, curator, archival, apparatus, optical, outgassing. Exceptions need a one-line reason in the script.
2. Every admin page and `server/api/admin/*` route responds 200 (`scripts/smoke-routes.mjs`).
3. `vue-tsc` (run from outside the project, as `nuxi typecheck` is non-functional) reports no new errors compared with the baseline taken before the work.
4. Filters, sorting, pagination, inspectors, create/edit dialogs and exports still work with the new values (verified by loading pages and calling the APIs with each new filter value).
5. A fresh reviewer finds no critical or important issues after one fix pass.

## 5. Design

### 5.1 Remove the unused storefront copies

Delete the files listed in section 2 after confirming with `grep` that nothing else imports them. Also delete `app/data/{auth}.ts` only if it is storefront-only; keep it if the admin auth pages use it. Check `app/components/profile/*` before removing account or auth types.

### 5.2 Taxonomy and products

- `ProductCategory` (`app/types/admin/products.ts`) becomes `"printers" | "copiers" | "inks-toner"`.
- `categoryMeta` and `categoryOptions` (`app/data/product-meta.ts`): Printers (`lucide:printer`), Photocopiers (`lucide:copy`), Inks & Toner (`lucide:droplets`).
- `ProductStatus` becomes `"active" | "testing" | "hold" | "draft"` (was `bench` and `quarantine`): testing = being tested before listing, hold = withdrawn or on hold. Labels and tones in `product-meta.ts` follow.
- `Product.unit` becomes `"unit" | "pack"` (was `"unit" | "roll"`).
- Templates in `app/data/admin-products.ts` are rebuilt from the storefront products (id, name, brand, price, spec line), with serial kinds `S/N` for machines and `LOT` for supplies. Generated variants use labels like "Starter pack", "Refurbished", "Demo unit", "Bulk pack", "Office bundle".
- The product editor sections (identity, specs, variants, dimensions, SEO, inventory, media) keep their structure. Spec templates and variant axes change to printer, copier and supply attributes (technology, paper size, speed, colour, yield, compatible models).

### 5.3 Categories screen

`app/data/admin-categories.ts` becomes a three-branch tree: Printers (Inkjet, Laser, Large-format, Portable), Photocopiers (A4 multifunction, A3 mono, A3 colour, Production), Inks & Toner (Ink, Toner, Drum units, Multi-colour sets). SKU counts add up to the register size.

### 5.4 Inventory

- `Vault` (`"FKT-01" | "ZUR-OPT" | "GOT-01"`) becomes `Warehouse` (`"CAI-01" | "GIZ-02" | "ALX-01"`), labelled Cairo main, Giza branch and Alexandria depot. The type, filters, dialogs, movement feed and demo data follow.
- Movement types keep their structure; labels change (for example "Calibration hold" becomes "Test hold").

### 5.5 Orders

The order domain unions are renamed to fit the new business, in `app/types/admin/orders.ts`, `app/data/order-meta.ts`, `app/data/admin-orders.ts`, `app/data/order-pricing.ts`, the order components, pages and exports:

| Old | New |
| --- | --- |
| `OrderStage`: escrowClearing, cleanroomQa, outgassing, inTransit, settled | awaitingPayment, checking, packing, inTransit, completed |
| `EscrowMode`: awaitingWire, funded, qaHold, settled | `PaymentState`: awaitingTransfer, paid, onHold, settled |
| `ClientTier`: museumCustody, galleryPremium, institutionalArchive, collectiveGuild | `AccountTier`: enterprise, business, printShop, home |
| `OrderPriority`: priority, commercial, archive, metrology, hold, standard, vip | urgent, bulk, installation, service, hold, standard, vip |

Order lines, ledger events, notes, shipments and pipeline copy are rewritten (installation visits, test prints, courier tracking). Query parameter values in URLs change with the unions, and old values fall back to "all".

### 5.6 Customers, coupons, content, analytics, users, settings, dashboard, auth

- **Customers:** organisation names, cities (`NODES`), segments and tiers use `AccountTier`; notes and activity use the new order vocabulary.
- **Coupons:** codes, names and eligible categories for printers, copiers and supplies (for example a toner bulk discount).
- **Content:** banner, collection and promo blocks for the three categories and the Print Lab service.
- **Analytics:** categories, top products, funnel and cohort labels use the new categories and products.
- **Users and roles:** role names and permission descriptions (for example "Warehouse manager", "Service technician") replace lab and vault wording.
- **Settings:** store name, shipping and tax copy, operations and finance sections.
- **Dashboard:** KPI labels, low-stock list, top products, recent orders and customers use the new data.
- **Auth pages and layout:** sign-in, register, forgot and reset copy; sidebar, header and notifications wording; the brand mark subtitle.

### 5.7 Tooling

Add `scripts/check-vocabulary.mjs` and `scripts/smoke-routes.mjs` (and `check:vocab` and `smoke` npm scripts) to the admin project, adapted from the storefront versions. The smoke script requests each page and each `server/api/admin/*` endpoint with each filter value that changed.

## 6. Order of work

1. Tooling and baseline (vocabulary count, `vue-tsc` error list, smoke results before the change).
2. Remove the unused storefront copies.
3. Taxonomy and products (types, meta, admin-products), then categories.
4. Inventory (`Warehouse`).
5. Orders (unions, meta, data, components, exports), then customers.
6. Coupons, content, analytics, users and roles, settings, dashboard.
7. Auth pages, layout components, remaining copy.
8. Final sweep: vocabulary, smoke, `vue-tsc` against the baseline, browser console check, fresh reviewer.

Each step leaves the app building and running.

## 7. Risks

- **Wide surface:** 112 files and 1,109 matches today. The vocabulary script and the type checker are the safety net.
- **Renamed unions:** a missed reference compiles in places `vue-tsc` cannot see (string literals in templates and query strings). The smoke test calls each API with every new value, and the reviewer checks templates.
- **Shared data with the storefront:** the two apps keep separate copies of the sample products. They must stay in step by hand until a shared backend exists.
- **Persisted state:** the admin stores little in localStorage (theme, locale, auth). Saved filter state, if any, must tolerate old values.
