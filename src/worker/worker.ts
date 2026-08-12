import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config';
import { GmailServices } from "../services";

const connection = new IORedis(
    env.REDIS_CONNECTION_URL,
    { maxRetriesPerRequest: null }
);

const gmailServices = new GmailServices();

const worker = new Worker(
  'sync-mail',
  async job => {
    const { userId } = job.data;
    await gmailServices.syncGmail(userId);
  },
  { connection },
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed`, error);
});
