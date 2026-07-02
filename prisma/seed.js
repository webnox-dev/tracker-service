require('dotenv/config');

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, TrackingEventType } = require('@prisma/client');

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL must be defined to run the seed script.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingCount = await prisma.trackingEvent.count();

  if (existingCount > 0) {
    console.log('Seed skipped because tracking events already exist.');
    return;
  }

  const event = await prisma.trackingEvent.create({
    data: {
      anonymousId: '11111111-1111-4111-8111-111111111111',
      sessionId: '22222222-2222-4222-8222-222222222222',
      accountId: 'demo-site',
      eventType: TrackingEventType.PAGE_VIEW,
      url: 'https://example.com/pricing',
      path: '/pricing',
      title: 'Pricing',
      referrer: 'https://google.com',
      timestamp: new Date('2026-06-18T12:00:00.000Z'),
      timeOnPage: 95,
      scrollPercentage: 82,
      metadata: {
        browser: 'Chrome',
        device: 'Desktop',
        language: 'en',
      },
    },
  });

  console.log(`Seeded tracking event ${event.id}`);
}

main()
  .catch((error) => {
    console.error('Seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
