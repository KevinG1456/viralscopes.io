import { loadConfig } from './config';
import { buildServer } from './server';

async function main(): Promise<void> {
  const config = loadConfig();
  const app = buildServer();

  await app.listen({ port: config.port, host: '0.0.0.0' });
}

main().catch((err: unknown) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
