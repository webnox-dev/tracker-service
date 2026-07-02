export default () => ({
  app: {
    port: Number.parseInt(process.env.PORT ?? '3001', 10),
    serviceName: process.env.SERVICE_NAME ?? 'tracker-service',
    swaggerPath: process.env.SWAGGER_PATH ?? 'api/docs',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
  },
});
