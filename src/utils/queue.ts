import { Queue } from 'bullmq';
import { env } from '../config';
export const myQueue = new Queue('sync-mail', {
    connection: {
        url: env.REDIS_CONNECTION_URL
    }
});

async function addJobs() {
  await myQueue.add('myJobName', { userId: 'bar' });
  await myQueue.add('myJobName', { userId: 'baz' });
}

await addJobs();
