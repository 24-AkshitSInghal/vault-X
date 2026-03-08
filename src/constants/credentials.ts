/**
 * VaultX — Dummy Credentials (Development / QA only)
 * ─────────────────────────────────────────────────────
 * DO NOT ship these to production. Move to a secure
 * backend-authenticated flow before release.
 */

export const DUMMY_CREDENTIALS = {
  lock: {
    id: 'LOCK-001',
    password: 'lock@123',
  },
  open: {
    id: 'OPEN-001',
    password: 'open@123',
  },
} as const;

export type FlowType = keyof typeof DUMMY_CREDENTIALS;
