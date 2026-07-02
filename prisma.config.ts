import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const migrationConnectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/tracker_service';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: migrationConnectionUrl,
  },
});
