const messages = {
  "not-found": [404, "Not found"],
  self: [409, "You cannot lock yourself out"],
  "last-super": [409, "At least one active Owner must remain"],
  "role-in-use": [409, "Role still has operators"],
  locked: [409, "This role is locked"],
} as const;

/** Turns a refused write from the access store into an HTTP error the screen can read. */
export const accessError = (reason: keyof typeof messages) => {
  const [statusCode, statusMessage] = messages[reason];
  return createError({ statusCode, statusMessage, data: { reason } });
};
