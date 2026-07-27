import 'dotenv/config';

import { createDbClient } from '../client.js';
import { seedOrganisations } from './organisations.seed.js';
import { seedUsers } from './users.seed.js';

function loadDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and set it, or export it directly.',
    );
  }
  return url;
}

async function main(): Promise<void> {
  const db = createDbClient(loadDatabaseUrl());
  try {
    const seededUsers = await seedUsers(db);
    console.log(`Users: admin=${seededUsers.admin.email} member=${seededUsers.member.email}`);

    const org = await seedOrganisations(db, seededUsers);
    console.log(`Organisation: ${org.slug} (${org.id})`);

    console.log('Seed complete.');
  } finally {
    await db.$client.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
