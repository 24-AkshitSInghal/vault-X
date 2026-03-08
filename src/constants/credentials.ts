/**
 * VaultX — Dummy Credentials (Development / QA only)
 * ─────────────────────────────────────────────────────
 * DO NOT ship these to production. Move to a secure
 * backend-authenticated flow before release.
 */

export const DUMMY_CREDENTIALS = {
  lock: {
    id: 'vaultx test',
    password: 'VxT',
  },
  open: {
    id: 'vaultx test',
    password: 'VxT',
  },
} as const;

export type FlowType = keyof typeof DUMMY_CREDENTIALS;
