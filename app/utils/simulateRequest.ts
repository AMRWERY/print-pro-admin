/**
 * Stand-in for a network round trip. There is no backend behind the cart, bookings or
 * vouchers yet, so actions `await simulateRequest()` to give the user real loading feedback.
 * Swap it for the real call when an API exists.
 */
export const simulateRequest = (ms = 400) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
