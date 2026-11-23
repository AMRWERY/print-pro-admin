# Dynamic product categories (admin, API, user site)

Date: 2026-11-23. Status: approved by the owner on 2026-11-23, with the proposed defaults for the three open decisions.
Projects: `admin` (Nuxt 4 admin app), `api` (Express, SQLite/Turso), `user` (Nuxt 4 storefront). They live side by side under `PrintPro/`.

## Intent and why

The admin has a Categories screen where an admin adds, renames, hides and reorders categories. Nothing reads them: a product's category is one of three hard-coded values (`printers`, `copiers`, `inks-toner`) and the user website has its own fixed list of those three. So a category added in admin appears nowhere.

The person running the shop wants a category they add in admin to be a real category everywhere: choosable on a product, shown in the user site's navigation and category pages, and used by reports, coupons and inventory. They chose the fully dynamic approach ("B") over a narrower "browsing layer on top of the three types".

## Goals

- Categories are data. Adding, renaming, hiding, reordering or deleting one in admin changes the product form, the user website, analytics, coupons and inventory filters.
- The three existing categories become ordinary, editable entries. No existing product, coupon or setting needs migrating, because the three keys stay exactly as they are.
- The list is flat (no sub-categories; the admin screen no longer creates them).
- The user site builds its menu, home-page category grid, category pages and filters from a public categories endpoint.

## Non-goals

- Sub-categories / category trees.
- Per-category custom attribute schemas. A new category's products get no technical filters (see "Kind").
- Changing prices, stock or orders.
- Image upload for categories.

## Anti-goals (this would be a failure even if it "works")

- Deleting or hiding a category silently orphaning products or breaking a report/coupon that points at it.
- An admin-visible change that does not reach the user site, or the reverse.
- The three built-in categories losing their specs/filters on the user site.

## Constraints

- Neither `admin` nor `user` has a type checker installed (`nuxi typecheck` needs `vue-tsc`). Only the `api` is type-checked and tested (`npm test`, 26+ tests). Admin/user changes are therefore verified by reading, grep for leftover uses, and (recommended) adding `vue-tsc` as a dev dependency. Decision needed from the owner: see "Open decisions".
- A bug found while surveying: the user site and admin keep their own copies of static category lists (`user/app/data/*`, `admin/app/data/product-meta.ts`). These must all be replaced, not just one.
- Data lives in the database as persisted lists (`docs` table) and is seeded in code. The three built-in categories must be seeded in code and are therefore created on every fresh database. Existing databases (local file and Turso) already hold seeded categories from an older shape, so there is a one-time migration for stored categories.

## Approaches considered

1. **A. Browsing layer on top of the three fixed types.** Keep `ProductCategory` as three values; admin categories only drive the user site's navigation. Contained (about a dozen files) but reports, coupons and inventory would still group by the three types, so an added category would not appear there. Rejected by the owner.
2. **B. Fully dynamic categories everywhere (chosen).** `ProductCategory` becomes a string key that references a live category. Touches about 40 files across three projects; riskier but consistent.

Decision: **B**, built in three verifiable stages (API, admin, user).

## Design

### The category record (API, single source of truth)

Existing fields stay (`id`, `code`, `name`, `slug`, `parentId`, `order`, `visibility`, `abstract`, `icon`, `megamenu`, `publicIndexing`, `facetRank`, `defaultSort`). Changes:

- **`key`** (new): the stable identifier products, coupons and URLs use, such as `printers`. Lowercase letters, digits and dashes, unique, generated from the name on create, immutable afterwards (rename changes `name` only). For the three built-ins `key` equals today's values: `printers`, `copiers`, `inks-toner`.
- **`kind`** (new): `printer` | `copier` | `supply` | `general`. It decides what the storefront does with a product's technical attributes: the three built-ins keep their kinds (`printer`, `copier`, `supply`) and therefore their specs and filters; every new category is `general` (no technical filters, default copy). `kind` is set when the category is created and cannot be changed afterwards (changing it would invalidate its products' attributes).
- **`skus`** is no longer stored; it is computed from the products in the category.
- `parentId` stays in the type and is always `null` (flat list). No code path sets it.
- Seed: the three built-ins (`Printers`, `Photocopiers`, `Inks & Toner`) with their current icons and kinds, visible, in that order. Stored categories from the older seed (15 demo rows, since removed from most databases) are discarded by a migration that runs once if the stored list lacks `key` fields.

Validation: name 2 to 80 characters, key unique, slug unique. **Deleting** a category that still has products returns 409 "N products use this category. Move them first." (no automatic reassignment). A category can be **hidden** with products in it; hiding removes it from the user site but not from admin or reports.

### Products, coupons and everything keyed by category

- `ProductCategory` becomes `string`. A product's `category` is validated against the keys of existing categories (today a bad value silently falls back to `printers`; it now fails with a field message "Choose a category").
- Coupons' `categories: string[]` are validated against existing keys. Deleting a category referenced by a coupon is blocked the same way as products (409 naming the coupons).
- All static label/icon/option lists are replaced by lookups against the live category list:
  - API: `categoryMeta`, `categoryOptions`, `categoryLabel` in `data/product-meta.ts` and `data/admin-analytics.ts` become functions that read the categories store; analytics' category breakdown iterates the live categories instead of the fixed three; the fixed `["all","printers","copiers","inks-toner"]` query validators accept any existing key.
  - Admin: `data/product-meta.ts` (`categoryMeta`, `categoryOptions`) is replaced by a small composable (`useCategories()`) backed by a Pinia store that loads `/api/admin/categories` once and refreshes after any category change. About 14 components/pages that index `categoryMeta[x]` switch to `useCategories().label(key)` / `.icon(key)` / `.options()`. A key that no longer resolves renders as the raw key with a neutral icon (never throws).
  - The product form's Category select, the products and inventory toolbars, the coupon editor and analytics filters list the live categories.

### The user website

- New public endpoint `GET /api/categories`: visible categories only, ordered, each with `key`, `name`, `slug`, `icon`, `abstract`, `kind`, and `count` (products currently on sale in it). Cached briefly. A category with zero products on sale is still listed (so a new category is visible), but the UI can mark it "coming soon".
- `GET /api/catalog` is unchanged in shape; each product's `category` is the key, `group` is derived from the category `kind` (`printer`/`copier`/`ink`/`general`), `attrs` are the kind's defaults (`general` has none).
- The user site loads the categories once (server-side store), replacing the static `categoryOptions`, `categoryKeywords`, the home-page `discipline-grid`, `category-nav`, `mobile-menu` entries, the `products/[category]` route validation, filter chips and compare/search text. The category page route accepts any visible key and shows the category's name, abstract and products; an unknown or hidden key is a 404.
- Technical attribute filters (`attrFilterDefs`) apply only to products of kinds that have them.

### Build stages (each verifiable on its own)

1. **API.** Category model + migration + seeds, key/kind validation, computed counts, `/api/categories`, product/coupon/analytics/inventory changes, delete guards. `npm test` extended (new tests: add category, assign a product, it appears in `/api/categories` and `/api/catalog`, hide/delete guards, analytics lists it, coupon references it).
2. **Admin.** `useCategories`, replace the static lists in about 14 places, Categories screen gains Key (read-only after create) and Kind, product form uses the live list, delete errors surfaced. No visual redesign.
3. **User.** Categories store and endpoint, replace the static lists and fixed route handling, generic category page.

Each stage ends with a leftover scan (grep for the old static names and the three literal keys outside the seed) and, where available, tests/type check.

## What is left to the builder

Exact file-by-file edits; naming of the composable/store; how the stored-category migration is detected; the "coming soon" wording and styling; cache duration on `/api/categories`; whether the home-page grid shows empty categories.

## Storefront files in scope

Live and category-keyed (must change): API `storefront/catalog.ts`, `storefront/data/{catalog,home,product-details}.ts`, `routes/storefront.ts`, `types/catalog`; user site `app/data/{catalog,compare,home,product-details}.ts`, `app/types/catalog/index.ts`, `composables/useCatalog.ts`, `composables/useComparison.ts`, `stores/{catalogStore,compareStore}.ts`, `pages/products/[category].vue`, `pages/index.vue`, `pages/wishlist/index.vue`, `components/{catalog,compare,home,layouts}/*` that read them, and `nuxt.config.ts` (a redirect to `/products/inks-toner`). Also `admin/scripts/smoke-routes.mjs`. The static demo catalog in `api/src/storefront/data/catalog.ts` stays: it only supplies copy and specs for admin products linked by SKU, and its three keys are the built-ins. `app/data/info-pages.ts` is not category-keyed.

## Calls made by the builder (not the owner)

- **General category on the storefront:** a product in a `general` category has no technical `attrs`; its detail page shows a "Key specifications" list built from its tag, spec line and brand (the detail builder already does this when attrs are absent). Its `group` is `general` with a neutral package icon; compare shows the basic rows; the search/keyword text uses the category name.
- **Stored-category migration:** merge, not discard. Rows without a `key` get one from their slug; the three built-ins are added if missing; any admin edits (names, order, visibility) are kept.
- **Key vs slug:** the user-site URL segment is the immutable `key`. `slug` stays as admin-only listing metadata and is also returned by `/api/categories`.
- **Visibility:** `active` shows a category; `staging` and `hidden` remove it from the menu, home grid and its own page (404). Its products stay on sale and reachable by direct link and search (see Open decision 3).
- **Key creation:** generated from Latin letters and digits in the name; when the name has none (for example Arabic) it falls back to `category-N`. The admin may type a key on create; it is read-only afterwards. Reserved route words are rejected.
- **`count`:** products listed on the storefront (active, published, storefront channel), regardless of stock. Empty categories are still returned; the user site decides how to show them.
- **`skus`:** computed per request from products, for both the categories screen and inventory.
- **Stage compatibility:** stage 1 keeps the existing admin working (the three built-in keys are valid, the category record only gains fields), so each stage can ship alone.
- **Hard-coded keys outside the seed** (`nuxt.config.ts`, `smoke-routes.mjs`) are updated.

## Decisions (settled)

1. Install `vue-tsc` as a dev dependency in `admin` and `user` to type-check the changes: **yes**.
2. Deleting a category that still has products: **blocked** with a clear message (409), no automatic reassignment.
3. Hiding or staging a category: **its products stay on sale** and findable by search and direct link; only the category entry and page are hidden.
