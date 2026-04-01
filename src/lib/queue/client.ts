import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { logger } from "@/lib/utils/logger";

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  }
  return redisConnection;
}

// Queue names
export const QUEUE_NAMES = {
  AI_ANALYSIS: "ai-analysis",
  AI_STORE_COPY: "ai-store-copy",
  AI_SCREENSHOTS: "ai-screenshots",
  AI_EXPERIMENTS: "ai-experiments",
  AI_RECOMMENDATIONS: "ai-recommendations",
  ASSET_PROCESSING: "asset-processing",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// Job data types
export interface AIAnalysisJobData {
  projectId: string;
  description: string;
  extraContext?: string;
}

export interface AIStoreCopyJobData {
  projectId: string;
  platform: "ios" | "android";
  locale: string;
  audienceSegmentId?: string;
}

export interface AIScreenshotJobData {
  projectId: string;
  platform: "ios" | "android";
  locale: string;
}

// Queue factory
export function createQueue(name: QueueName) {
  return new Queue(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
}

// Add job helper
export async function addJob<T>(queueName: QueueName, data: T, options?: object) {
  const queue = createQueue(queueName);
  const job = await queue.add(queueName, data, options);
  logger.info(`Queue: Added job ${job.id} to ${queueName}`);
  await queue.close();
  return job;
}
