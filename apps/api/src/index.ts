import { loadConfig } from './config.js';
import { buildServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const app = buildServer(config);

  await app.listen({ port: config.port, host: '0.0.0.0' });

  // Docker sends SIGTERM on `docker stop` / a Compose rolling replace.
  // Fastify's close() stops accepting new connections and waits for
  // in-flight requests before resolving — see Deployment_Guide.md §12.
  process.on('SIGTERM', () => {
    app.log.info('SIGTERM received — starting graceful shutdown');
    app
      .close()
      .then(() => {
        app.log.info('Graceful shutdown complete');
        process.exit(0);
      })
      .catch((err: unknown) => {
        app.log.error({ err }, 'Error during graceful shutdown');
        process.exit(1);
      });
  });
}

main().catch((err: unknown) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
