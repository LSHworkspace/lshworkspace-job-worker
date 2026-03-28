import { logger } from "./lib/logger.js";
import { createEmailWorker } from "./workers/email.worker.js";
import { createOAuthMaintenanceWorker } from "./workers/oauth-maintenance.worker.js";
import { createBlogWorker } from "./workers/blog.worker.js";
import { createWebhookWorker } from "./workers/webhook.worker.js";
import { registerScheduledJobs } from "./schedulers/index.js";
import type { Worker, Queue } from "bullmq";

const workers: Worker[] = [];
const queues: Queue[] = [];

async function main() {
  logger.info("Starting LSHworkspace Job Worker...");

  // Register all workers
  workers.push(createEmailWorker());
  workers.push(createOAuthMaintenanceWorker());
  workers.push(createBlogWorker());
  workers.push(createWebhookWorker());

  logger.info(`${workers.length} workers started`, {
    queues: workers.map((w) => w.name),
  });

  // Register scheduled/repeatable jobs
  const schedulerQueues = await registerScheduledJobs();
  queues.push(...schedulerQueues);

  logger.info("All scheduled jobs registered");
  logger.info("Job Worker is ready and listening for jobs");
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  // Close workers (finish current jobs)
  await Promise.all(workers.map((w) => w.close()));
  logger.info("All workers stopped");

  // Close scheduler queues
  await Promise.all(queues.map((q) => q.close()));
  logger.info("All queues closed");

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

main().catch((err) => {
  logger.error("Fatal error starting worker", { error: err.message });
  process.exit(1);
});
