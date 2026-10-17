import { pickerSearch } from "~/data/admin-inventory";

// Product lookup for the stock dialogs.
export default defineEventHandler(async (event) => {
  const q = getQuery(event).q;
  return pickerSearch(typeof q === "string" ? q : "");
});
