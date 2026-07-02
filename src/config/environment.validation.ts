type EnvironmentConfig = Record<string, unknown>;

interface ValidatedEnvironment {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  SERVICE_NAME: string;
  SWAGGER_PATH: string;
  CORS_ORIGIN: string;
}

function getRequiredString(config: EnvironmentConfig, key: string): string {
  const value = config[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Environment variable ${key} is required.`);
  }

  return value.trim();
}

function getOptionalString(config: EnvironmentConfig, key: string, fallback: string): string {
  const value = config[key];

  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value !== 'string') {
    throw new Error(`Environment variable ${key} must be a string.`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function validateEnvironment(config: EnvironmentConfig): ValidatedEnvironment {
  const port = Number.parseInt(getOptionalString(config, 'PORT', '3001'), 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('Environment variable PORT must be a valid port number.');
  }

  return {
    NODE_ENV: getOptionalString(config, 'NODE_ENV', 'development'),
    PORT: port,
    DATABASE_URL: getRequiredString(config, 'DATABASE_URL'),
    SERVICE_NAME: getOptionalString(config, 'SERVICE_NAME', 'tracker-service'),
    SWAGGER_PATH: getOptionalString(config, 'SWAGGER_PATH', 'api/docs'),
    CORS_ORIGIN: getOptionalString(config, 'CORS_ORIGIN', '*'),
  };
}
