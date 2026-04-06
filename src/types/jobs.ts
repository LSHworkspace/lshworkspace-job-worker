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
  BLOG: "blog",
  WEBHOOK: "webhook",
} as const;
