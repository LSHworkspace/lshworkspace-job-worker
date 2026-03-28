import { Worker, Job } from "bullmq";
import { createHmac } from "node:crypto";
import { redisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { QUEUE_NAMES, type DispatchWebhookJobData } from "../types/jobs.js";

async function processWebhookJob(
  job: Job<DispatchWebhookJobData>
): Promise<void> {
  const { url, event, payload, secret } = job.data;

  logger.info("Dispatching webhook", {
    jobId: job.id,
    url,
    event,
    attempt: job.attemptsMade + 1,
  });

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": event,
  };

  if (secret) {
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    headers["X-Webhook-Signature"] = `sha256=${signature}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Webhook delivery failed: ${res.status} ${res.statusText}`);
  }

  logger.info("Webhook delivered", { jobId: job.id, url, status: res.status });
}

export function createWebhookWorker(): Worker<DispatchWebhookJobData> {
  const worker = new Worker<DispatchWebhookJobData>(
    QUEUE_NAMES.WEBHOOK,
    processWebhookJob,
    {
      connection: redisConnection,
      concurrency: 10,
    }
  );

  worker.on("completed", (job) => {
    logger.info("Webhook job completed", { jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error("Webhook job failed", {
      jobId: job?.id,
      attempt: job?.attemptsMade,
      error: err.message,
    });
  });

  return worker;
}
