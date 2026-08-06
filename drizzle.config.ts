import { defineConfig } from 'drizzle-kit';
import { env } from './src/config';

export default defineConfig({
  out: './src/db/migration',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
