import { createServer } from "node:http";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createApp } from "./app.js";

const config = loadConfig();
const logger = createLogger(config);
const app = createApp({ config, logger });
const server = createServer(app.handler);

server.listen(config.port, config.host, () => {
  logger.info("service started", {
    host: config.host,
    port: config.port,
    readinessDelayMs: config.readinessDelayMs
  });
});

if (config.readinessDelayMs > 0) {
  setTimeout(() => {
    app.setReady(true);
    logger.info("service became ready");
  }, config.readinessDelayMs);
}

function shutdown(signal) {
  logger.warn("shutdown signal received", { signal });
  app.setReady(false);

  const forceExitTimer = setTimeout(() => {
    logger.error("forcing shutdown after grace period");
    process.exit(1);
  }, config.shutdownGraceMs);

  server.close((error) => {
    clearTimeout(forceExitTimer);

    if (error) {
      logger.error("shutdown failed", { error: error.message });
      process.exit(1);
      return;
    }

    logger.info("shutdown completed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
