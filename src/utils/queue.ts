import { Queue } from 'bullmq';
import { env } from '../config';
export const queue = new Queue('Queue', {
    connection: {
        url: env.REDIS_CONNECTION_URL
    }
});
