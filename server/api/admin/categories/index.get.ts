import { listCategories } from "~/data/admin-categories";

export default defineEventHandler(async () => {
  await simulateLatency(300);
  return listCategories();
});
