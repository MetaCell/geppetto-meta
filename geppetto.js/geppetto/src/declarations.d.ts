/*
 * @metacell/ami is the MetaCell fork of the AMI medical-imaging library,
 * published on npm. All imports from it are typed as `any` in the source code.
 */
declare module "@metacell/ami";

/*
 * Minimal process.env shim so files that guard dev-only code with
 * `process.env.NODE_ENV === 'development'` pass type checking.
 * Vite statically replaces this at build time.
 */
declare const process: { env: { NODE_ENV: string } };
