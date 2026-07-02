# Tracker Service

Phase 1 Tracker Service for the B2B Intent Platform. This NestJS service accepts tracking events from the JavaScript SDK, validates them, stores them in PostgreSQL through Prisma, and exposes health and Swagger endpoints.

## Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Swagger
- class-validator
- class-transformer
- ESLint
- Prettier

## Project Structure

```text
src/
  tracker/
    tracker.controller.ts
    tracker.service.ts
    tracker.repository.ts
    tracker.module.ts
    dto/
    entities/
    interfaces/
  health/
  common/
    dto/
    filters/
    interceptors/
    exceptions/
    validators/
  config/
  prisma/
  app.module.ts
```

## Environment Variables

Copy [.env.example](./.env.example) to `.env` and adjust as needed.

```env
NODE_ENV=development
PORT=3001
SERVICE_NAME=tracker-service
SWAGGER_PATH=api/docs
CORS_ORIGIN=*
DATABASE_URL=postgresql://postgres.whlekdtcqtghrwqwwvfu:[YOUR-SUPABASE-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.whlekdtcqtghrwqwwvfu:[YOUR-SUPABASE-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

- `DATABASE_URL` is used by the running NestJS service through Prisma's Postgres driver adapter.
- `DIRECT_URL` is used by Prisma CLI commands such as migrations and seeding.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure Supabase credentials in `.env`:

```bash
# Replace [YOUR-SUPABASE-PASSWORD] in DATABASE_URL and DIRECT_URL
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Seed sample data:

```bash
npm run db:seed
```

5. Start the service:

```bash
npm run start:dev
```

This exposes:

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## Optional Containerization

`Dockerfile` and `docker-compose.yml` are still included for deployment flexibility, but the recommended development setup for this project is Supabase rather than running PostgreSQL locally in Docker.

## API Endpoints

### `GET /health`

```json
{
  "success": true,
  "service": "tracker-service",
  "status": "healthy",
  "timestamp": "2026-06-27T09:30:00.000Z"
}
```

### `POST /api/v1/events`

```json
{
  "anonymousId": "11111111-1111-4111-8111-111111111111",
  "sessionId": "22222222-2222-4222-8222-222222222222",
  "accountId": "demo-site",
  "eventType": "page_view",
  "url": "https://example.com/pricing",
  "path": "/pricing",
  "title": "Pricing",
  "referrer": "https://google.com",
  "timestamp": "2026-06-18T12:00:00.000Z",
  "timeOnPage": 95,
  "scrollPercentage": 82,
  "metadata": {
    "browser": "Chrome",
    "device": "Desktop",
    "language": "en"
  }
}
```

Successful response:

```json
{
  "success": true,
  "message": "Event received successfully",
  "data": {
    "id": "a7c783f5-e24f-4d04-96c4-f0466d1e55fd"
  }
}
```

Validation error response:

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": [
    "eventType must be one of the following values: page_view, click, form_submit, download, video_play, custom"
  ]
}
```

## Architecture Notes

- Controllers only coordinate HTTP input and output.
- `TrackerService` holds application orchestration logic.
- `TrackingEventRepository` isolates persistence so Kafka or another sink can be introduced later without changing the API contract.
- Prisma access stays inside the repository layer.
- Global validation, logging, and exception handling are registered in `main.ts`.

## Useful Commands

```bash
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:deploy
npm run db:seed
```

## Sample Requests

Sample API requests are available in [requests.http](./requests.http).
