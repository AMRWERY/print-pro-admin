# Admin Dashboard Pivot (Printers, Photocopiers, Inks & Toner) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin dashboard manage a store that sells printers, photocopiers and ink & toner, with demo data that matches the storefront.

**Architecture:** The admin is a Nuxt app whose screens read deterministic demo data from `app/data/admin-*.ts`, served by `server/api/admin/*`. The pivot swaps the product taxonomy, renames the domain unions that carry the old vocabulary (order stage, payment state, account tier, priority, warehouse, product status), rewrites the demo records and every label, and deletes unused storefront copies. Two Node scripts (a vocabulary check and a route/API smoke test) plus `vue-tsc` run from outside the project replace a test runner, which the project lacks.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind 3, Pinia, `@nuxtjs/i18n`, `vue-tsc` (external).

**Spec:** `docs/superpowers/specs/2026-10-31-admin-printers-copiers-inks-pivot-design.md`

## Global Constraints

- Project root: `D:\Studying\Not Done Projects\PrintPro\admin` (its own git repo). The storefront is a separate repo; do not edit it.
- `ProductCategory = "printers" | "copiers" | "inks-toner"`. Category labels: Printers, Photocopiers, Inks & Toner. Icons: `lucide:printer`, `lucide:copy`, `lucide:droplets`.
- Products are the storefront's 31 sample products (ids, names, SKUs, brands and prices copied from `user/app/data/catalog.ts`), plus generated variants. Prices in EGP.
- Renamed unions (exact new values):
  - `ProductStatus`: `active | testing | hold | draft` (was `bench`, `quarantine`).
  - `Product.unit`: `unit | pack` (was `roll`).
  - `OrderStage`: `awaitingPayment | checking | packing | inTransit | completed`.
  - `EscrowMode` becomes `PaymentState`: `awaitingTransfer | paid | onHold | settled`.
  - `ClientTier` becomes `AccountTier`: `enterprise | business | printShop | home`.
  - `OrderPriority`: `urgent | bulk | installation | service | hold | standard | vip`.
  - `Vault` becomes `Warehouse`: `CAI-01 | GIZ-02 | ALX-01` (Cairo main, Giza branch, Alexandria depot).
- Banned vocabulary (case-insensitive, whole word) in `app/` and `server/`: camera, cameras, lens, lenses, lighting, audio, tripod, tripods, medium format, colorimeter(s), baryta, cine, hasselblad, photograph*, atelier, cleanroom, escrow, vault, metrology, requisition, spectro*, curator, archival, apparatus, optical, outgassing, qaHold.
- Demo data stays deterministic: fixed "today" (`2026-10-31`), stable ids.
- Layout, visual design, permissions and export formats do not change.
- Type check: `nuxi typecheck` does not work here. Use `vue-tsc` installed outside the project: `C:\...\tsc-tool\node_modules\.bin\vue-tsc --noEmit -p .nuxt/tsconfig.app.json`. The gate is "no new errors against the Task 1 baseline".
- Do not commit unless the user asks. A task's "Checkpoint" step means run the checks and report.

## Review Focus

1. A renamed union value left behind in a template string, query parameter, default or export column (compiles, fails at runtime). Expected: every old value is gone, and an old value in a URL falls back to "all".
2. Filters that match nothing: each new `category`, `stage`, `payment`, `tier`, `priority`, `warehouse` and `status` value must return rows from its API.
3. Totals that no longer add up: category SKU counts versus register size, KPI counts versus list totals, order stage counts versus rows.
4. Imports of deleted storefront files, and types used only by them.
5. Demo customer and order records mixing old and new vocabulary (for example a gallery name with a printer order).

---

## File Structure

- Create `scripts/check-vocabulary.mjs`, `scripts/smoke-routes.mjs`; modify `package.json` (scripts `check:vocab`, `smoke`).
- Delete `app/data/{catalog,cameras,home,account,account-orders,printing,product-details}.ts`, `server/api/{catalog.get.ts,products/[id].get.ts,account/orders.get.ts}`, and storefront-only types and components found by grep in Task 2.
- Modify types in `app/types/admin/{products,inventory,orders,customers,coupons,content,analytics,dashboard,settings,users,categories}.ts`.
- Modify data in `app/data/{admin-*,product-meta,category-meta,inventory-meta,order-meta,order-pricing,customer-meta,coupon-meta,content-meta,analytics-meta,users-meta,settings-meta,admin-nav,auth}.ts`.
- Modify components under `app/components/{products,categories,inventory,orders,customers,coupons,content,analytics,users,settings,dashboard,profile,layouts,auth,shared}/`, pages under `app/pages/`, utils `app/utils/{order-export,customer-export,analytics-export,product-variants}.ts`, composables `useNotifications.ts`.

---

### Task 1: Tooling and baseline

**Files:**
- Create: `scripts/check-vocabulary.mjs`, `scripts/smoke-routes.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run check:vocab` exits 1 and prints `file:line: word` for each banned word in `app/**/*.{vue,ts,json}` and `server/**/*.ts` (whole word, case-insensitive; an `ALLOW` array of `path:word` for documented exceptions). `npm run smoke -- <baseUrl>` requests every page route and every `GET /api/admin/*` endpoint from the File Structure list and exits 1 on any non-200 (or on a status listed as expected in the script's `ROUTES` array). The vocabulary script must avoid backslashes in regex source (build patterns with `new RegExp` and lookarounds, or `String.raw`) because the shell tooling strips them.

- [ ] **Step 1:** Write both scripts. Initial smoke list: pages `/`, `/orders`, `/orders/<an existing id>`, `/customers`, `/products`, `/products/<an existing id>`, `/products/new`, `/categories`, `/coupons`, `/content`, `/users`, `/inventory`, `/analytics`, `/settings`, `/profile`, `/auth`; APIs `/api/admin/dashboard`, `/api/admin/orders`, `/api/admin/customers`, `/api/admin/products`, `/api/admin/categories`, `/api/admin/coupons`, `/api/admin/content`, `/api/admin/inventory`, `/api/admin/inventory/movements`, `/api/admin/analytics`, `/api/admin/analytics/top-products`, `/api/admin/roles`, `/api/admin/users`, `/api/admin/settings`, `/api/admin/revenue`.
- [ ] **Step 2:** Run `npm run check:vocab`. Expected: FAIL with the baseline count (about 1,100 matches). Record it.
- [ ] **Step 3:** Start the dev server (or confirm one is running), run `npm run smoke -- http://localhost:<port>`. Expected: all ok. Record the page URL ids used.
- [ ] **Step 4:** Install `vue-tsc` and `typescript` in a directory outside the project, run it, save the error list to a scratch file. This is the baseline.
- [ ] **Step 5:** Checkpoint: report the three baselines.

### Task 2: Remove unused storefront copies

**Files:**
- Delete: `app/data/{catalog,cameras,home,account,account-orders,printing,product-details}.ts`, `server/api/catalog.get.ts`, `server/api/products/[id].get.ts`, `server/api/account/orders.get.ts`

**Interfaces:**
- Consumes: nothing. Produces: a tree where none of the deleted modules is imported.

- [ ] **Step 1:** For each file run `grep -rn "<name>" app server` and delete only if the only importers are other files in the delete list.
- [ ] **Step 2:** `app/data/auth.ts` and `app/components/profile/*`: keep if the admin auth or profile pages import them; otherwise delete. List what was kept and why.
- [ ] **Step 3:** Delete storefront-only types (`grep` each type file in `app/types/` for importers) and components with no importers.
- [ ] **Step 4:** Run `vue-tsc` and diff against the baseline. Expected: no new errors (errors from deleted files disappear).
- [ ] **Step 5:** Run smoke. Expected: all ok. Run `npm run check:vocab` and report the drop.

### Task 3: Taxonomy, products and categories

**Files:**
- Modify: `app/types/admin/products.ts`, `app/data/product-meta.ts`, `app/data/admin-products.ts`, `app/utils/product-variants.ts`, `app/types/admin/categories.ts`, `app/data/category-meta.ts`, `app/data/admin-categories.ts`, `app/components/products/*`, `app/components/categories/*`, `app/pages/products/**`, `app/pages/categories/index.vue`

**Interfaces:**
- Produces: `ProductCategory`, `ProductStatus`, `Product.unit` per Global Constraints; `categoryMeta: Record<ProductCategory, {label, icon}>`; `statusMeta` and `statusOptions` for `active | testing | hold | draft`; `templates: Template[]` built from the 31 storefront products with `serialKind` `S/N` (machines) or `LOT` (supplies); category tree with three roots (Printers: Inkjet, Laser, Large-format, Portable; Photocopiers: A4 multifunction, A3 mono, A3 colour, Production; Inks & Toner: Ink, Toner, Drum units, Multi-colour sets) whose SKU counts sum to the register size (`TOTAL`).
- Consumes: Task 1 scripts.

- [ ] **Step 1:** Change the types and meta; fix every compile error `vue-tsc` reports (it lists each use of the old values).
- [ ] **Step 2:** Rebuild `templates`, the hand-picked `seeds` (keep 8 seeds with the same low-stock pattern), `VARIANTS` ("Starter pack", "Refurbished", "Demo unit", "Bulk pack", "Office bundle") and status assignment (`testing` and `hold` replace `bench` and `quarantine`, keep the same counts).
- [ ] **Step 3:** Update product editor sections, spec templates, variant axes, toolbar filters and KPI labels for the new categories and statuses.
- [ ] **Step 4:** Rewrite the categories data and inspector copy.
- [ ] **Step 5:** Verify: `GET /api/admin/products?category=printers|copiers|inks-toner` each returns rows; `?status=testing` and `?status=hold` return rows; `?category=cameras` falls back to all. `GET /api/admin/categories` totals equal `TOTAL`. Add these calls to `smoke-routes.mjs`.
- [ ] **Step 6:** `vue-tsc` against baseline, smoke, vocabulary drop. Checkpoint.

### Task 4: Inventory (Warehouse)

**Files:**
- Modify: `app/types/admin/inventory.ts`, `app/data/inventory-meta.ts`, `app/data/admin-inventory.ts`, `app/components/inventory/*`, `app/pages/inventory/index.vue`, `server/api/admin/inventory/*`

**Interfaces:**
- Produces: `type Warehouse = "CAI-01" | "GIZ-02" | "ALX-01"`; `InventoryItem.warehouse: Warehouse` (was `vault`), `InventoryItem.testHold: boolean` (was `qaHold`); `InventoryQuery.warehouse` (was `vault`); `InventoryFilter` value `"qa"` becomes `"hold"`; `warehouseMeta: Record<Warehouse, {label: string}>`.
- Consumes: Task 3 `Product`.

- [ ] **Step 1:** Rename the types and every use (`vault`, `Vault`, `qaHold`, `"qa"`). Rename `transfer` dialog wording (warehouse to warehouse).
- [ ] **Step 2:** Rewrite bins ("A-01-03"), movement labels and demo movements (test hold, receive, transfer, adjust) for supplies and machines.
- [ ] **Step 3:** Verify: `GET /api/admin/inventory?warehouse=CAI-01|GIZ-02|ALX-01` each return rows; `?filter=hold` returns rows; `POST /api/admin/inventory/transfer` with a Warehouse pair succeeds; old values (`FKT-01`, `qa`) fall back to all. Add to smoke.
- [ ] **Step 4:** `vue-tsc` against baseline, smoke, vocabulary. Checkpoint.

### Task 5: Orders and customers

**Files:**
- Modify: `app/types/admin/orders.ts`, `app/types/admin/customers.ts`, `app/data/{order-meta,order-pricing,admin-orders,customer-meta,admin-customers}.ts`, `app/components/orders/*`, `app/components/customers/*`, `app/pages/orders/**`, `app/pages/customers/index.vue`, `app/utils/{order-export,customer-export}.ts`, `server/api/admin/orders*`, `server/api/admin/customers/*`

**Interfaces:**
- Produces: `OrderStage`, `PaymentState`, `AccountTier`, `OrderPriority` per Global Constraints. `OrderRow.customer.tier: AccountTier`; `OrdersQuery.payment: "all" | PaymentState` (was `escrow`); `stageMeta`, `paymentMeta`, `tierMeta`, `priorityMeta` records keyed by the new values. Customer `CustomerTier` maps to `AccountTier`. Demo customers: offices, schools, hospitals, print shops in Cairo, Giza, Alexandria, Riyadh, Dubai and similar (`NODES`).
- Consumes: Task 3 products (order lines use real product ids and SKUs).

- [ ] **Step 1:** Rename the unions and the `escrow` query/field to `payment` everywhere (types, data, components, exports, API handlers). Old query values fall back to "all".
- [ ] **Step 2:** Rewrite pipeline stages, ledger events, shipment and note copy, order-create modal options and export column headers.
- [ ] **Step 3:** Rewrite demo customers, activity and notes. Keep ids, counts (`TOTAL`) and dates deterministic.
- [ ] **Step 4:** Verify: `GET /api/admin/orders?stage=<each>`, `?payment=<each>`, `?tier=<each>` return rows; order detail for an existing id returns 200 with new values; `POST /api/admin/orders` with a valid body succeeds; customers list and detail return 200; old values fall back. Add to smoke.
- [ ] **Step 5:** `vue-tsc` against baseline, smoke, vocabulary. Checkpoint.

### Task 6: Coupons, content, analytics, dashboard

**Files:**
- Modify: `app/data/{admin-coupons,coupon-meta,admin-content,content-meta,admin-analytics,analytics-meta,admin-dashboard}.ts`, `app/types/admin/{coupons,content,analytics,dashboard}.ts`, `app/components/{coupons,content,analytics,dashboard}/*`, `app/pages/{coupons,content,analytics}/index.vue`, `app/pages/index.vue`, `app/utils/analytics-export.ts`, `server/api/admin/{coupons,content,analytics,dashboard.get.ts,revenue.get.ts}`

**Interfaces:**
- Produces: coupon eligible categories typed with `ProductCategory`; analytics `CategoryRow`s for the three categories; dashboard low-stock and top-product lists using Task 3 products; content block palettes (banner, collection, promo) for the three categories and the Print Lab service.
- Consumes: Task 3 `ProductCategory`, `allProducts`.

- [ ] **Step 1:** Rewrite coupon demo data (codes such as `TONER-BULK`, `OFFICE-2026`, `WELCOME5`), tiers (`AccountTier`) and copy.
- [ ] **Step 2:** Rewrite content blocks, placement names and copy.
- [ ] **Step 3:** Rewrite analytics categories, funnel and cohort labels, top-products derivation, and dashboard KPI labels and lists.
- [ ] **Step 4:** Verify: `GET /api/admin/coupons?...` and `/api/admin/content`, `/api/admin/analytics`, `/api/admin/analytics/top-products`, `/api/admin/dashboard`, `/api/admin/revenue` return 200 with new vocabulary; analytics category rows reference only the three categories.
- [ ] **Step 5:** `vue-tsc` against baseline, smoke, vocabulary. Checkpoint.

### Task 7: Users, roles, settings, auth and layout

**Files:**
- Modify: `app/data/{admin-users,users-meta,admin-settings,settings-meta,admin-nav,auth}.ts`, `app/types/admin/{users,settings}.ts`, `app/components/{users,settings,profile,auth,layouts,shared}/*`, `app/pages/{users,settings,profile,auth}/**`, `app/composables/useNotifications.ts`, `app/config/i18n/locales/{en,ar}.json`, `app/components/shared/VBrandMark.vue`

**Interfaces:**
- Produces: role names (Owner, Store manager, Warehouse manager, Service technician, Sales, Support) and permission descriptions; settings copy for store name, shipping, tax, operations and finance; notification templates; brand subtitle "Printers & Copiers"; locale JSON values free of banned words.
- Consumes: Tasks 3 to 6 vocabulary.

- [ ] **Step 1:** Rewrite roles, permissions and demo operators; settings sections; notifications; auth aside and form copy.
- [ ] **Step 2:** Rewrite layout wording (sidebar, header, user menu, notifications dialog) and any value in the locale JSON files that matches the banned list.
- [ ] **Step 3:** Verify: `GET /api/admin/roles`, `/api/admin/users`, `/api/admin/settings` return 200; settings `PUT` with the current document succeeds.
- [ ] **Step 4:** `vue-tsc` against baseline, smoke, vocabulary. Checkpoint.

### Task 8: Final sweep

**Files:**
- Modify: `scripts/check-vocabulary.mjs` (allow list only, each entry with a reason)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1:** Run `npm run check:vocab`. Expected: 0 matches (or only documented `ALLOW` entries).
- [ ] **Step 2:** Run `npm run smoke -- <baseUrl>`. Expected: all ok, including every new filter value and every old-value fallback.
- [ ] **Step 3:** Run `vue-tsc` and diff against the Task 1 baseline. Expected: no new errors.
- [ ] **Step 4:** Load each page in headless Edge with console logging; expected: no Vue warnings or errors.
- [ ] **Step 5:** Search for softer leftovers (studio, bench, gallery, museum, fine-art, calibration, courier-aviation wording) in user-visible strings and fix any that contradict the new business.
- [ ] **Step 6:** Checkpoint: final report with the three results, any allow-listed exceptions, and follow-ups (separate storefront/admin sample data, hard-coded strings not in i18n, placeholder demo records).
