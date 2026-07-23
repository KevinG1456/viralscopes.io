import { loadConfig } from './config';
import { buildServer } from './server';

async function main(): Promise<void> {
  const config = loadConfig();
  const app = await buildServer(config);

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
