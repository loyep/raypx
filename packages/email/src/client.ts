/**
 * Email client exports only - no React templates.
 * Use this for packages that don't need JSX/React (e.g. auth, rpc).
 */
export { createResendClient, ResendEmailClient } from "./resend";
export type { EmailOptions, EmailResult, ResendConfig } from "./types";
export { EmailError } from "./types";
