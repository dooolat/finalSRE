import { randomUUID } from "node:crypto";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { MetricsRegistry } from "./metrics.js";
import { OrderStore } from "./store.js";

function writeJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function writeText(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "content-type": "text/plain; version=0.0.4; charset=utf-8",
    ...headers
  });
  response.end(payload);
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createApp({
  config = loadConfig(),
  store = new OrderStore(),
  metrics = new MetricsRegistry(),
  logger = createLogger(config)
} = {}) {
  let ready = config.readinessDelayMs === 0;

  const requestCounter = metrics.counter(
    "http_requests_total",
    "Total HTTP requests served."
  );
  const requestDuration = metrics.histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds."
  );
  const inFlightGauge = metrics.gauge(
    "http_in_flight_requests",
    "Current number of in-flight HTTP requests."
  );
  const ordersCreated = metrics.counter(
    "orders_created_total",
    "Total number of successfully created orders."
  );

  async function handler(request, response) {
    const startedAt = process.hrtime.bigint();
    const requestId = request.headers["x-request-id"] || randomUUID();
    const method = request.method ?? "GET";
    const url = new URL(request.url ?? "/", "http://localhost");
    let route = "unmatched";
    let statusCode = 500;

    response.setHeader("x-request-id", requestId);
    inFlightGauge.inc();

    try {
      if (method === "GET" && url.pathname === "/healthz") {
        route = "/healthz";
        statusCode = 200;
        writeJson(response, statusCode, {
          status: "ok",
          service: config.serviceName,
          version: config.version
        });
        return;
      }

      if (method === "GET" && url.pathname === "/readyz") {
        route = "/readyz";
        statusCode = ready ? 200 : 503;
        writeJson(response, statusCode, {
          status: ready ? "ready" : "starting",
          service: config.serviceName
        });
        return;
      }

      if (method === "GET" && url.pathname === "/metrics") {
        route = "/metrics";
        statusCode = 200;
        writeText(response, statusCode, metrics.render());
        return;
      }

      if (method === "GET" && url.pathname === "/products") {
        route = "/products";
        statusCode = 200;
        writeJson(response, statusCode, {
          items: store.getProducts()
        });
        return;
      }

      if (method === "GET" && url.pathname === "/orders") {
        route = "/orders";
        statusCode = 200;
        writeJson(response, statusCode, {
          items: store.listOrders()
        });
        return;
      }

      if (method === "POST" && url.pathname === "/orders") {
        route = "/orders";
        const body = await readJsonBody(request);
        const order = store.createOrder(body);
        ordersCreated.inc({ currency: order.currency });
        statusCode = 201;
        writeJson(response, statusCode, {
          item: order
        });
        return;
      }

      if (method === "GET" && url.pathname === "/") {
        route = "/";
        statusCode = 200;
        writeJson(response, statusCode, {
          service: config.serviceName,
          environment: config.environment,
          version: config.version,
          endpoints: [
            "GET /healthz",
            "GET /readyz",
            "GET /products",
            "GET /orders",
            "POST /orders",
            "GET /metrics"
          ]
        });
        return;
      }

      route = url.pathname;
      statusCode = 404;
      writeJson(response, statusCode, {
        error: "not_found",
        message: `No route matched ${method} ${url.pathname}`
      });
    } catch (error) {
      statusCode = error instanceof SyntaxError ? 400 : 422;
      if (!(error instanceof SyntaxError)) {
        logger.warn("request validation failed", {
          requestId,
          route,
          error: error.message
        });
      }
      writeJson(response, statusCode, {
        error: "bad_request",
        message:
          error instanceof SyntaxError ? "invalid JSON body" : error.message
      });
    } finally {
      const durationSeconds =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

      inFlightGauge.dec();
      requestCounter.inc({
        method,
        route,
        status_code: String(statusCode)
      });
      requestDuration.observe(
        {
          method,
          route
        },
        durationSeconds
      );

      logger.info("request completed", {
        requestId,
        method,
        route,
        statusCode,
        durationMs: Math.round(durationSeconds * 1000)
      });
    }
  }

  return {
    handler,
    setReady(nextState) {
      ready = nextState;
    },
    isReady() {
      return ready;
    }
  };
}
