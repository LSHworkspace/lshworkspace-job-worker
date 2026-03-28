import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import {
  QUEUE_NAMES,
  type RevalidatePageJobData,
  type GenerateSitemapJobData,
  type RebuildSearchIndexJobData,
} from "../types/jobs.js";

type BlogJobData =
  | RevalidatePageJobData
  | GenerateSitemapJobData
  | RebuildSearchIndexJobData;

async function processBlogJob(job: Job<BlogJobData>): Promise<void> {
  logger.info("Processing blog job", { jobId: job.id, name: job.name });

  switch (job.name) {
    case "revalidate-page": {
      const { path } = job.data as RevalidatePageJobData;
      const nextjsUrl = process.env.NEXTJS_URL || "http://localhost:3000";
      const secret = process.env.REVALIDATE_SECRET || "";

      try {
        const res = await fetch(
          `${nextjsUrl}/api/revalidate?path=${encodeURIComponent(path)}&secret=${secret}`
        );
        if (!res.ok) {
          throw new Error(`Revalidation failed: ${res.status}`);
        }
        logger.info("Page revalidated", { jobId: job.id, path });
      } catch (err) {
        logger.error("Revalidation failed", {
          jobId: job.id,
          path,
          error: (err as Error).message,
        });
        throw err;
      }
      break;
    }

    case "generate-sitemap": {
      // TODO: Fetch all posts from DB, generate sitemap.xml
      logger.info("Sitemap generated (stub)", { jobId: job.id });
      break;
    }

    case "rebuild-search-index": {
      // TODO: Rebuild chosung search index for Korean posts
      logger.info("Search index rebuilt (stub)", { jobId: job.id });
      break;
    }

    default:
      logger.warn("Unknown blog job", { name: job.name });
  }
}

export function createBlogWorker(): Worker<BlogJobData> {
  const worker = new Worker<BlogJobData>(QUEUE_NAMES.BLOG, processBlogJob, {
    connection: redisConnection,
    concurrency: 3,
  });

  worker.on("completed", (job) => {
    logger.info("Blog job completed", { jobId: job.id, name: job.name });
  });

  worker.on("failed", (job, err) => {
    logger.error("Blog job failed", {
      jobId: job?.id,
      name: job?.name,
      error: err.message,
    });
  });

  return worker;
}
