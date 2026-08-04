import app from './app';

async function bootstrap() {

    // variable
    const PORT = process.env.PORT ?? 3001;

  // Start HTTP server
  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });

  console.log(`Server running on port ${PORT}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
