import Bull from "bull";
import { JobPayload, ProcessingResult } from "../types";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create job queues for different processing types
export const processingQueue = new Bull<JobPayload>("processing", redisUrl);

// Job processors will be registered in the workers module
processingQueue.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} completed for project ${job.data.projectId}`);
});

processingQueue.on("failed", (job, err) => {
  console.error(
    `[Queue] Job ${job?.id} failed for project ${job?.data.projectId}:`,
    err.message
  );
});

processingQueue.on("error", (err) => {
  console.error("[Queue] Queue error:", err);
});

export async function enqueueJob(
  payload: JobPayload,
  priority: number = 0
): Promise<string> {
  const job = await processingQueue.add(payload, {
    priority,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });

  console.log(
    `[Queue] Enqueued job ${job.id} (type: ${payload.type}) for project ${payload.projectId}`
  );
  return job.id.toString();
}

export async function getJobStatus(jobId: string) {
  const job = await processingQueue.getJob(jobId);
  if (!job) return null;

  const progress = job.progress() as number;
  const state = await job.getState();

  return {
    id: job.id,
    type: job.data.type,
    state,
    progress,
    failedReason: job.failedReason,
    stacktrace: job.stacktrace,
  };
}

export async function clearQueue() {
  await processingQueue.clean(0, "completed");
  await processingQueue.clean(0, "failed");
}
