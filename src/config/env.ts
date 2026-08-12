import 'dotenv/config';

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  CLIENT_ID: getEnv("CLIENT_ID"),
  CLIENT_SECRET: getEnv("CLIENT_SECRET"),
  OAUTH_ENCRYPTION_KEY: getEnv("OAUTH_ENCRYPTION_KEY"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  REDIS_CONNECTION_URL: getEnv("REDIS_CONNECTION_URL")
};
