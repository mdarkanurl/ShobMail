import { Queue } from 'bullmq';
import { env } from '../config';
export const syncMailQueue = new Queue('sync-mail', {
    connection: {
        url: env.REDIS_CONNECTION_URL
    }
});
