// Pretends to purge the storefront edge cache so new content shows at once.
export default defineEventHandler(async () => {
  await simulateLatency(900);
  return { flushedAt: new Date().toISOString() };
});
