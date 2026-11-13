/**
 * Shared secret for the app's own session JWT.
 *
 * Kept in a separate module so Edge middleware can import the value without
 * pulling in the Node-only `jsonwebtoken` package.
 */
export const JWT_SECRET =
  process.env.JWT_SECRET || 'bookhaven_dev_secret_change_in_production';
