import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

const migrationConnectionUrl = process.env.DIRECT_URL ?? env('DATABASE_URL');

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
