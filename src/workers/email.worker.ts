import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { sendEmail } from "../lib/mailer.js";
import { templates } from "../lib/templates.js";
import { QUEUE_NAMES, type SendEmailJobData } from "../types/jobs.js";

async function processEmailJob(job: Job<SendEmailJobData>): Promise<void> {
  const { to, subject, template, variables } = job.data;

  logger.info("Processing email job", { jobId: job.id, to, template });

  const templateFn = templates[template];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${template}`);
  }

  const html = templateFn(variables);
  await sendEmail({ to, subject, html });

  logger.info("Email sent", { jobId: job.id, to, template });
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
