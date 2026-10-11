/**
 * Mock API latency so loading states are real while the data is still local.
 * Delete the calls (or this file) when the endpoints are backed by a real service.
 */
export const simulateLatency = (ms = 350) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
