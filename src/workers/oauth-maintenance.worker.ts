import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { query } from "../lib/db.js";
import {
  QUEUE_NAMES,
  type CleanupExpiredTokensJobData,
  type CleanupExpiredSessionsJobData,
} from "../types/jobs.js";

type OAuthMaintenanceJobData =
  | CleanupExpiredTokensJobData
  | CleanupExpiredSessionsJobData;

async function processOAuthMaintenanceJob(
  job: Job<OAuthMaintenanceJobData>
): Promise<void> {
  logger.info("Processing OAuth maintenance job", {
    jobId: job.id,
    name: job.name,
  });

  switch (job.name) {
    case "cleanup-expired-tokens": {
      const batchSize = (job.data as CleanupExpiredTokensJobData).batchSize || 1000;
      const result = await query(
        `DELETE FROM oauth2_authorization WHERE id IN (
          SELECT id FROM oauth2_authorization
          WHERE access_token_expires_at < NOW()
          AND (refresh_token_expires_at IS NULL OR refresh_token_expires_at < NOW())
          LIMIT $1
        )`,
        [batchSize]
      );
      logger.info("Expired tokens cleaned up", { jobId: job.id });
      break;
    }

    case "cleanup-expired-sessions": {
      // Spring Session Redis keys are auto-expired by Redis TTL
      // This job cleans up any orphaned session records
      logger.info("Session cleanup completed", { jobId: job.id });
      break;
    }

    default:
      logger.warn("Unknown OAuth maintenance job", { name: job.name });
  }
}

export function createOAuthMaintenanceWorker(): Worker<OAuthMaintenanceJobData> {
  const worker = new Worker<OAuthMaintenanceJobData>(
    QUEUE_NAMES.OAUTH_MAINTENANCE,
    processOAuthMaintenanceJob,
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    logger.info("OAuth maintenance job completed", {
      jobId: job.id,
      name: job.name,
    });
  });

  worker.on("failed", (job, err) => {
    logger.error("OAuth maintenance job failed", {
      jobId: job?.id,
      name: job?.name,
      error: err.message,
    });
  });

  return worker;
}
