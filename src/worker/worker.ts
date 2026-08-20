import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config';
import { GmailServices, StatisticsServices } from "../services";

const connection = new IORedis(
    env.REDIS_CONNECTION_URL,
    { maxRetriesPerRequest: null }
);

const gmailServices = new GmailServices();
const statisticsServices = new StatisticsServices();

const worker = new Worker(
  'Queue',
  async job => {
    switch (job.name) {
      case "syncMailQueue":
        const { userId } = job.data;
        await gmailServices.syncGmail(userId);
        break;
      case "sender-source-insights":
        statisticsServices.processSenderAndSourceInsightsRequest();
        break;
      default:
        break;
    }
  },
  { connection },
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed`, error);
});
