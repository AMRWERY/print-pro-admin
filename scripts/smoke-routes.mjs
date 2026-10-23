// Requests admin pages and API endpoints against a running server and checks the status codes.
// Usage: npm run smoke -- http://localhost:3000
const base = (process.argv[2] ?? "http://localhost:3000").replace(/[/]$/, "");

/** [path, expected]: a status number. Entries are added as tasks introduce new filter values. */
const ROUTES = [
  // Pages
  ["/en", 200],
  ["/ar", 200],
  ["/en/orders", 200],
  ["/en/customers", 200],
  ["/en/products", 200],
  ["/en/products/new", 200],
  ["/en/categories", 200],
  ["/en/coupons", 200],
  ["/en/content", 200],
  ["/en/users", 200],
  ["/en/inventory", 200],
  ["/en/analytics", 200],
  ["/en/settings", 200],
  ["/en/profile", 200],
  ["/en/auth", 200],
  // APIs
  ["/api/admin/dashboard", 200],
  ["/api/admin/revenue?range=month", 200],
  ["/api/admin/orders", 200],
  ["/api/admin/orders?stage=awaitingPayment", 200],
  ["/api/admin/orders?stage=checking", 200],
  ["/api/admin/orders?stage=packing", 200],
  ["/api/admin/orders?stage=inTransit", 200],
  ["/api/admin/orders?stage=completed", 200],
  ["/api/admin/orders?payment=awaitingTransfer", 200],
  ["/api/admin/orders?payment=paid", 200],
  ["/api/admin/orders?payment=onHold", 200],
  ["/api/admin/orders?payment=settled", 200],
  ["/api/admin/orders?tier=enterprise", 200],
  ["/api/admin/orders?tier=business", 200],
  ["/api/admin/orders?tier=printShop", 200],
  ["/api/admin/orders?tier=home", 200],
  ["/api/admin/orders/LP-948201", 200],
  ["/api/admin/customers", 200],
  ["/api/admin/customers?segment=enterprise", 200],
  ["/api/admin/customers?segment=business", 200],
  ["/api/admin/customers?segment=printShop", 200],
  ["/api/admin/customers?segment=home", 200],
  ["/api/admin/customers?segment=highLtv", 200],
  ["/api/admin/customers/cu-0", 200],
  ["/api/admin/products", 200],
  ["/api/admin/products?category=printers", 200],
  ["/api/admin/products?category=copiers", 200],
  ["/api/admin/products?category=inks-toner", 200],
  ["/api/admin/products?status=testing", 200],
  ["/api/admin/products?status=hold", 200],
  ["/api/admin/categories", 200],
  ["/api/admin/coupons", 200],
  ["/api/admin/coupons?type=percentage", 200],
  ["/api/admin/coupons?type=freight", 200],
  ["/api/admin/coupons?type=serviceCredit", 200],
  ["/api/admin/content", 200],
  ["/api/admin/inventory", 200],
  ["/api/admin/inventory?warehouse=CAI-01", 200],
  ["/api/admin/inventory?warehouse=GIZ-02", 200],
  ["/api/admin/inventory?warehouse=ALX-01", 200],
  ["/api/admin/inventory?filter=hold", 200],
  ["/api/admin/inventory?category=copiers", 200],
  ["/api/admin/inventory/movements", 200],
  ["/api/admin/analytics", 200],
  ["/api/admin/analytics?cohort=enterprise", 200],
  ["/api/admin/analytics?cohort=business", 200],
  ["/api/admin/analytics?cohort=printShop", 200],
  ["/api/admin/analytics/top-products", 200],
  ["/api/admin/analytics/top-products?category=copiers", 200],
  ["/api/admin/roles", 200],
  ["/api/admin/users", 200],
  ["/api/admin/settings", 200],
];

let failed = 0;
for (const [path, expected] of ROUTES) {
  let status = 0;
  try {
    status = (await fetch(base + path, { redirect: "manual" })).status;
  } catch (e) {
    status = -1;
  }
  if (status !== expected) {
    failed++;
    console.log(`FAIL ${path}: got ${status}, expected ${expected}`);
  } else console.log(`ok   ${path}`);
}
console.log(failed ? `\n${failed} route(s) failed` : "\nall routes ok");
process.exit(failed ? 1 : 0);
