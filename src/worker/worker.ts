import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config';

const connection = new IORedis(
    env.REDIS_CONNECTION_URL,
    { maxRetriesPerRequest: null }
);

const worker = new Worker(
  'sync-mail',
  async job => {
    const { userId } = job.data;
    console.log(userId);
  },
  { connection },
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed`, error);
});
