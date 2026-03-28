import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { QUEUE_NAMES, type SendEmailJobData } from "../types/jobs.js";

async function processEmailJob(job: Job<SendEmailJobData>): Promise<void> {
  const { to, subject, template, variables } = job.data;

  logger.info("Processing email job", {
    jobId: job.id,
    to,
    template,
    subject,
  });

  // TODO: Integrate with actual email provider (SMTP / SES / Resend)
  // For now, log the email that would be sent
  logger.info("Email sent (stub)", {
    jobId: job.id,
    to,
    subject,
    template,
    variables,
  });
}

export function createEmailWorker(): Worker<SendEmailJobData> {
  const worker = new Worker<SendEmailJobData>(
    QUEUE_NAMES.EMAIL,
    processEmailJob,
    {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info("Email job completed", { jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error("Email job failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  return worker;
}
