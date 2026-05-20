function toInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(env = process.env) {
  return {
    serviceName: env.SERVICE_NAME ?? "orders-service",
    environment: env.NODE_ENV ?? "development",
    version: env.APP_VERSION ?? "1.0.0",
    host: env.HOST ?? "0.0.0.0",
    port: toInteger(env.PORT, 8080),
    readinessDelayMs: toInteger(env.READINESS_DELAY_MS, 0),
    shutdownGraceMs: toInteger(env.SHUTDOWN_GRACE_MS, 10000),
    logLevel: env.LOG_LEVEL ?? "info"
  };
}
