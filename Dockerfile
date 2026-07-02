FROM node:22-alpine AS base

RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS dependencies

COPY package*.json ./
RUN npm ci

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY nest-cli.json tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM base AS runtime

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
