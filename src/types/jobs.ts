// ── Email Jobs ────────────────────────────────────
export interface SendEmailJobData {
  to: string;
  subject: string;
  template: "verification" | "password-reset" | "welcome" | "notification";
  variables: Record<string, string>;
}

// ── OAuth Maintenance Jobs ───────────────────────
export interface CleanupExpiredTokensJobData {
  batchSize?: number;
}

export interface CleanupExpiredSessionsJobData {
  batchSize?: number;
}

// ── Blog Jobs ────────────────────────────────────
export interface RevalidatePageJobData {
  path: string;
}

export interface GenerateSitemapJobData {
  baseUrl: string;
}

export interface RebuildSearchIndexJobData {
  locale?: string;
}

// ── Webhook Jobs ─────────────────────────────────
export interface DispatchWebhookJobData {
  url: string;
  event: string;
  payload: Record<string, unknown>;
  secret?: string;
}

// ── Queue Names ──────────────────────────────────
export const QUEUE_NAMES = {
  EMAIL: "email",
  OAUTH_MAINTENANCE: "oauth-maintenance",
  BLOG: "blog",
  WEBHOOK: "webhook",
} as const;
