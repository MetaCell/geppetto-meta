/*
 * Minimal process.env shim so files that guard dev-only code with
 * `process.env.NODE_ENV === 'development'` pass type checking.
 * Vite statically replaces this at build time.
 */
declare const process: { env: { NODE_ENV: string } };
