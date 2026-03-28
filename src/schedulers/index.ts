import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { QUEUE_NAMES } from "../types/jobs.js";

export async function registerScheduledJobs(): Promise<Queue[]> {
  const queues: Queue[] = [];

  // ── OAuth Maintenance ──────────────────────────
  const oauthQueue = new Queue(QUEUE_NAMES.OAUTH_MAINTENANCE, {
    connection: redisConnection,
  });

  await oauthQueue.upsertJobScheduler(
    "cleanup-expired-tokens-scheduler",
    { every: 3_600_000 }, // every 1 hour
    {
      name: "cleanup-expired-tokens",
      data: { batchSize: 1000 },
    }
  );

  await oauthQueue.upsertJobScheduler(
    "cleanup-expired-sessions-scheduler",
    { every: 600_000 }, // every 10 minutes
    {
      name: "cleanup-expired-sessions",
      data: { batchSize: 500 },
    }
  );

  queues.push(oauthQueue);
  logger.info("Registered OAuth maintenance schedules");

  // ── Blog ───────────────────────────────────────
  const blogQueue = new Queue(QUEUE_NAMES.BLOG, {
    connection: redisConnection,
  });

  await blogQueue.upsertJobScheduler(
    "generate-sitemap-scheduler",
    { pattern: "0 4 * * *" }, // daily at 04:00 KST
    {
      name: "generate-sitemap",
      data: { baseUrl: "https://lshworkspace.com" },
    }
  );

  await blogQueue.upsertJobScheduler(
    "rebuild-search-index-scheduler",
    { every: 21_600_000 }, // every 6 hours
    {
      name: "rebuild-search-index",
      data: {},
    }
  );

  queues.push(blogQueue);
  logger.info("Registered blog schedules");

  return queues;
}
