# Dynamic Product Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make categories real data: a category added in admin is choosable on a product, used by reports/coupons/inventory, and shown on the user website.

**Architecture:** `ProductCategory` becomes a string key that references a live category record (API is the single source of truth). The API exposes categories to admin (existing admin routes) and to the user site (new public `/api/categories`). Admin and user replace their static category lists with a store backed by those endpoints.

**Tech Stack:** Express + libSQL (`api`, tests with `npm test`, type check `npx tsc --noEmit`); Nuxt 4 + Pinia + Tailwind (`admin`, `user`; type check with `vue-tsc` once installed).

**Spec:** `admin/docs/superpowers/specs/2026-11-23-dynamic-categories-design.md` (approved 2026-11-23).

Repos (siblings under `D:\Studying\Not Done Projects\PrintPro\`): `api`, `admin`, `user`. Paths below are relative to the repo named in each task.

## Global Constraints

- Category `key`: lowercase letters, digits and dashes; unique; generated from the name on create; immutable afterwards. The three built-ins keep today's keys: `printers`, `copiers`, `inks-toner`.
- Category `kind`: `printer` | `copier` | `supply` | `general`; set on create, immutable. Built-ins are `printer`, `copier`, `supply`; every new category defaults to `general`.
- Name 2 to 80 characters; slug unique; the list is flat (`parentId` is always `null`).
- `skus` is computed from products, never stored.
- Deleting a category that still has products (or is referenced by a coupon) returns **409** with the message `"N products use this category. Move them first."` (coupons: `"N coupons use this category. Remove it from them first."`).
- Visibility `active` shows a category; `staging` and `hidden` remove it from the menu, home grid and its own page (404). Its products stay on sale and findable by search and direct link.
- A product whose category key no longer resolves renders as the raw key with a neutral icon; it never throws.
- `/api/categories` returns visible categories only, ordered, with `key`, `name`, `slug`, `icon`, `abstract`, `kind`, `count` (products on the storefront: active, published, storefront channel, regardless of stock). Empty categories are returned.
- Key creation: Latin letters/digits from the name; if none (for example Arabic) fall back to `category-N`; the admin may type a key on create; reserved route words are rejected.
- Install `vue-tsc` as a dev dependency in `admin` and `user`; use it as the check for every admin/user task.
- Do not commit unless the owner asks; the "Commit" steps below are checkpoints to propose, not to run unprompted.

## Review Focus

- A category name with no Latin letters (Arabic) or two names that produce the same key: gets `category-N` / a suffixed unique key, never an empty or duplicate key.
- Deleting a category that products or coupons still reference: blocked with the 409 message, nothing partially deleted.
- Hiding a category: it vanishes from the menu/page but its products stay on sale and reachable.
- A product or coupon pointing at a key that no longer exists (old data): lists render, nothing throws.
- Renaming a category: key and therefore URLs, coupons and products stay valid.

---

## Stage 1: API (`api`)

### Task 1: Category registry, `key`/`kind`, seeds and migration

**Files:**
- Modify: `src/types/admin/categories.ts`, `src/data/admin-categories.ts`, `src/types/admin/products.ts` (`ProductCategory = string`)
- Test: `test/api.test.ts`

**Interfaces:**
- Produces (`src/data/admin-categories.ts`): `categoryKeys(): string[]`, `categoryByKey(key: string): Category | undefined`, `categoryLabel(key: string): string` (name, or the raw key when missing), `categoryIcon(key: string): string` (icon, or `"lucide:package"`), `kindOf(key: string): CategoryKind` (`"general"` when missing), `productCountOf(key: string): number`.
- `Category` gains `key: string` and `kind: CategoryKind`; `skus` stays in the response type but is computed by `listCategories()` from products.
- `type CategoryKind = "printer" | "copier" | "supply" | "general"` exported from `src/types/admin/categories.ts`.

- [ ] **Step 1: Write failing tests** `"seeds the three built-in categories with their keys and kinds"` (GET `/api/admin/categories` returns exactly `printers/copiers/inks-toner`, kinds `printer/copier/supply`, `parentId` null, `skus` equals the product count) and `"fills in keys for stored categories that lack one"` (call the migration function directly on rows without `key`).
- [ ] **Step 2: Run** `npm test` → the two tests FAIL.
- [ ] **Step 3: Implement** the type changes, the seed list of three built-ins (names `Printers`, `Photocopiers`, `Inks & Toner`; icons `lucide:printer`, `lucide:copy`, `lucide:droplets`; visible; orders 0..2) and a one-time migration run when the store is created: rows without `key` get one from their slug; missing built-ins are added; admin edits to existing rows are kept. `skus` computed in `listCategories()`.
- [ ] **Step 4: Run** `npx tsc --noEmit && npm test` → PASS. (Other files that import `categoryMeta` still compile until Task 3.)
- [ ] **Step 5: Checkpoint** `feat(api): categories carry a key and kind`.

### Task 2: Category create/update/delete rules

**Files:**
- Modify: `src/data/admin-categories.ts`, `src/routes/admin/categories.ts`, `src/types/admin/categories.ts` (`CategoryInput` gains `key?: string`, `kind?: CategoryKind`)
- Test: `test/api.test.ts`

**Interfaces:**
- Consumes: Task 1 registry helpers; `productCountOf`.
- Produces: `slugKey(name: string, taken: Set<string>): string` (Latin-only, `category-N` fallback, suffixes `-2`, `-3` on collision, rejects reserved words `new`, `admin`, `api`, `search`); `createCategory(input)` returns the stored `Category`; `deleteCategory(id)` throws/returns a guard result the route maps to 409 with the Global Constraints messages.

- [ ] **Step 1: Write failing tests:** creating `"Scanners"` returns key `scanners`, kind `general`, `parentId` null; creating `"طابعات"` returns key `category-1` (then `category-2` for the next); a second `"Scanners"` gets `scanners-2`; PATCH renaming keeps `key` and `kind` and ignores any `key`/`kind` in the body; DELETE of a category that a product uses returns 409 `"1 products use this category. Move them first."` and the category still exists; DELETE of an unused category returns 200; a supplied `key` of `"Bad Key"` is rejected with a field message.
- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Implement** the helpers and route changes; `parentId` is forced to `null`; reorder works on the flat list; validation errors use the existing `fields` shape.
- [ ] **Step 4: Run** `npx tsc --noEmit && npm test` → PASS.
- [ ] **Step 5: Checkpoint** `feat(api): flat categories with generated keys and guarded delete`.

### Task 3: Products, coupons and inventory use live keys

**Files:**
- Modify: `src/data/product-meta.ts` (remove `categoryMeta`/`categoryOptions`), `src/data/admin-products.ts`, `src/data/admin-coupons.ts`, `src/data/admin-inventory.ts`, `src/types/admin/{coupons,inventory}.ts`, `src/routes/admin/products.ts`
- Test: `test/api.test.ts`

**Interfaces:**
- Consumes: `categoryKeys`, `categoryLabel`, `categoryIcon`, `kindOf` from Task 1.
- Produces: `productProblems(body)` adds `category: "Choose a category."` when `body.category` is not in `categoryKeys()`; products take `icon` and `spec` from `categoryIcon(key)`/`categoryLabel(key)`; coupons validate `categories` against live keys; query parsers for products, inventory and coupons accept `"all"` or any existing key.

- [ ] **Step 1: Write failing tests:** a product with `category: "nope"` → 400 with `fields.category`; a product in a newly created `scanners` category saves, lists with `icon` `lucide:package` and filters via `?category=scanners`; a coupon with `categories: ["scanners"]` saves and `["nope"]` is rejected; deleting `scanners` with that product/coupon is blocked (409 from Task 2).
  Also `"lists a product whose category key no longer exists without failing"`: write a product record with `category: "gone"` directly into the store, then `GET /api/admin/products`, `/api/admin/inventory` and `/api/admin/analytics` return 200, and that row's `icon` is `lucide:package`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the replacements; every former `categoryMeta[x]` becomes a registry lookup. Run `rg "categoryMeta|categoryOptions" src` to find them all.
- [ ] **Step 4: Run** `npx tsc --noEmit && npm test` → PASS.
- [ ] **Step 5: Checkpoint** `feat(api): products, coupons and inventory use live categories`.

### Task 4: Analytics by live categories

**Files:** Modify `src/data/admin-analytics.ts`, `src/types/admin/analytics.ts`. Test: `test/api.test.ts`.

**Interfaces:** Consumes `categoryKeys`, `categoryLabel`, `productCountOf`. Produces `buildAnalytics(...).categories` as one `CategoryRow` per live category (revenue 0 for none); `parseTopQuery` accepts any existing key; the exported `categoryLabel` here re-exports the registry one.

- [ ] **Step 1: Write failing test:** after creating `scanners` and a paid order for a product in it, `GET /api/admin/analytics` lists a `scanners` row with that revenue; `GET /api/admin/analytics/top-products?category=scanners` returns it.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** `npx tsc --noEmit && npm test` → PASS. **Step 5: Checkpoint** `feat(api): analytics follow live categories`.

### Task 5: Public categories endpoint and storefront catalog by kind

**Files:** Modify `src/storefront/catalog.ts`, `src/routes/storefront.ts`, `src/types/catalog/index.ts` (`CatalogCategory = string`, `group` gains `"general"`, `attrs` optional), `src/storefront/data/product-details.ts` (general products use the "Key specifications" path), `src/storefront/data/home.ts` (links built from keys, not literals). Test: `test/api.test.ts`.

**Interfaces:**
- Produces: `GET /api/categories` → `{ key, name, slug, icon, abstract, kind, count }[]` (visible only, ordered by `order`); `listStorefrontCategories(): StorefrontCategory[]` in `src/storefront/catalog.ts`. In `fromAdmin`, `group` and `attrs` come from `kindOf(a.category)`; `general` has no `attrs`.
- Consumes: Task 1 helpers; `catalogEntries()`.

- [ ] **Step 1: Write failing tests:** a new `scanners` category with one published product appears in `/api/categories` with `count: 1` and `kind: "general"`; the product appears in `/api/catalog` with `category: "scanners"`, `group: "general"` and no `attrs`, and `/api/products/<id>` returns a detail with a "Key specifications" group; setting the category to `hidden` removes it from `/api/categories` but the product stays in `/api/catalog` and `/api/products/<id>` still returns 200; an empty visible category is listed with `count: 0`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** `npx tsc --noEmit && npm test` → PASS. **Step 5: Checkpoint** `feat(api): public categories and generic storefront products`.

---

## Stage 2: Admin (`admin`)

### Task 6: Type-check baseline

**Files:** Modify `package.json` (add `vue-tsc` and `typescript` dev dependencies, script `"typecheck": "nuxt prepare && vue-tsc --noEmit"`).

- [ ] **Step 1:** `npm i -D vue-tsc typescript`. **Step 2:** `npm run typecheck`; save the error count and list to `docs/superpowers/plans/typecheck-baseline-admin.txt`. Expected: it runs; pre-existing errors are recorded, not fixed. **Step 3:** later tasks must add no new errors versus the baseline. **Step 4: Checkpoint** `chore(admin): add vue-tsc`.

### Task 7: `useCategories()` replaces the static category lists

**Files:**
- Create: `app/stores/categoriesStore.ts` (loads `GET /api/admin/categories` once; `refresh()`), `app/composables/useCategories.ts`
- Modify: `app/data/product-meta.ts` (remove `categoryMeta`, `categoryOptions`), `app/types/admin/products.ts` (`ProductCategory = string`), and every consumer: `components/analytics/{analytics-categories,analytics-products-table}.vue`, `components/coupons/{coupon-inspector,coupons-list}.vue`, `components/inventory/{inventory-item-dialog,inventory-toolbar}.vue`, `components/products/{product-card,product-identity-section,products-list,products-toolbar}.vue`, `pages/inventory/index.vue`, `pages/products/index.vue`, `utils/analytics-export.ts`, `stores/productsStore.ts`, `types/admin/{analytics,coupons,inventory}.ts`

**Interfaces:**
- Produces `useCategories()` returning `{ items: Ref<Category[]>, label(key: string): string, icon(key: string): string, options(withAll?: boolean): { value: string; label: string }[], load(): Promise<void> }`. `label` returns the raw key and `icon` returns `lucide:package` for unknown keys. The store loads on first use (`load()` is idempotent) and refreshes after any category save or delete.
- Admin `Category` type gains `key` and `kind`; `parentId` stays but is unused.

- [ ] **Step 1:** write the store and composable. **Step 2:** replace each consumer (`rg "categoryMeta|categoryOptions" app` must end empty). The product form's Category select uses `options()` and defaults to the first option. **Step 3:** `npm run typecheck` shows no new errors versus the baseline. **Step 4:** open the products, inventory, coupons and analytics pages in `npm run dev` and confirm labels and icons render for all three built-ins. **Step 5: Checkpoint** `refactor(admin): categories come from the API`.

### Task 8: Categories screen: key, kind, delete errors

**Files:** Modify `app/components/categories/category-inspector.vue`, `app/pages/categories/index.vue`, `app/stores/categoriesStore.ts` (from Task 7), `app/types/admin/categories.ts`.

- [ ] **Step 1:** the inspector shows **Key** (editable on create with hint "Used in links and reports. Letters, numbers and dashes. Cannot be changed later.", read-only after) and **Kind** (select on create: General, Printers, Photocopiers, Ink & toner; read-only after). **Step 2:** a 409 on delete shows the server message in the existing delete dialog instead of closing it; after any save or delete call the shared store's `refresh()`. **Step 3:** `npm run typecheck` shows no new errors; manual check: add `Scanners`, it appears in the product form's Category select without a reload; deleting it while a product uses it shows the message. **Step 4: Checkpoint** `feat(admin): category key and kind, guarded delete`.

### Task 9: Admin leftovers

**Files:** Modify `scripts/smoke-routes.mjs` (the `?category=inks-toner` route stays valid; add `/api/admin/categories`).

- [ ] **Step 1:** `rg "inks-toner|\"printers\"|\"copiers\"" app scripts` lists only seed-equivalent literals outside tests; remove or justify each. **Step 2:** `npm run typecheck` and the smoke script pass. **Step 3: Checkpoint** `chore(admin): drop leftover category literals`.

---

## Stage 3: User site (`user`)

### Task 10: Type-check baseline

**Files:** Modify `package.json` (same as Task 6). Steps identical; save `docs/typecheck-baseline-user.txt` (create `docs/` if missing, in `user`).

### Task 11: Categories store and server route; static lists removed

**Files:**
- Create: `server/api/categories.get.ts` (`forward(event, "/api/categories")`), `app/stores/categoriesStore.ts`
- Modify: `app/types/catalog/index.ts` (`CatalogCategory = string`), `app/data/catalog.ts` (remove `categoryOptions`, `categoryKeywords`, `categoryPages`; `attrFilterDefs` stays keyed by the three built-in keys and returns `[]` for any other), `app/composables/useCatalog.ts`, `app/composables/useComparison.ts`, `app/data/compare.ts`, `app/stores/{catalogStore,compareStore}.ts`, `app/data/product-details.ts`

**Interfaces:**
- Produces: `useCategoriesStore()` with `items: Category[]`, `byKey(key: string): Category | undefined`, `label(key: string): string` (raw key when unknown), `fetch(): Promise<void>`; `Category` = `{ key, name, slug, icon, abstract, kind, count }`.
- Filters: category filter options come from `items`; `attrFilterDefs[key] ?? []`.

- [ ] **Step 1:** implement. **Step 2:** `rg "categoryOptions|categoryKeywords|categoryPages" app` must end empty. **Step 3:** `npm run typecheck` shows no new errors versus the baseline. **Step 4: Checkpoint** `refactor(user): categories come from the API`.

### Task 12: Navigation, category page, home grid, general products

**Files:** Modify `app/pages/products/[category].vue` (look the key up in the store; unknown or hidden → `createError({ statusCode: 404 })`; title, description from the category), `app/components/layouts/{category-nav,mobile-menu}.vue`, `app/components/home/discipline-grid.vue` and `app/data/home.ts` (grid built from the store), `app/components/catalog/catalog-filters.vue`, `app/pages/wishlist/index.vue`, `app/pages/index.vue`, `nuxt.config.ts` (the `/products/paper-ink` redirect target stays `/products/inks-toner`, which remains a built-in key), product detail/card components that show category or attribute rows (guard for products without `attrs`).

- [ ] **Step 1:** implement. Empty visible categories show their name with a "Coming soon" note on the home grid and an empty-state on their page (use the existing empty-state component, with a link back to all products). **Step 2:** `npm run typecheck` shows no new errors. **Step 3:** manual check with the API and both apps running: add `Scanners` (general) in admin, add a product in it and save; the user site menu, home grid and `/products/scanners` show it and the product; hide the category and the menu/page disappear while the product still shows in search and on its own URL. **Step 4: Checkpoint** `feat(user): categories drive the menu, home grid and category pages`.

### Task 13: End-to-end check

**Files:** none new. Optionally add an API test `"a category added in admin reaches the storefront end to end"` combining Tasks 2, 3 and 5 in one flow if not already covered.

- [ ] **Step 1:** `cd api && npm test` passes. **Step 2:** in `admin` and `user` run `npm run typecheck` (no new errors versus the baselines). **Step 3:** repeat the manual check of Task 12 once more after restarting the API (so migration runs on the real database) and confirm the three built-ins still show their specs and filters on the user site. **Step 4:** report results, including any type-check baseline errors that remain.
