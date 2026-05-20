import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { createApp } from "../src/app.js";

async function createTestServer() {
  const app = createApp();
  app.setReady(true);
  const server = createServer(app.handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  return {
    app,
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
}

test("GET /healthz returns service health", async () => {
  const { server, baseUrl } = await createTestServer();
  try {
    const response = await fetch(`${baseUrl}/healthz`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "orders-service");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("POST /orders creates a new order and GET /orders lists it", async () => {
  const { server, baseUrl } = await createTestServer();
  try {
    const createResponse = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        customerEmail: "buyer@example.com",
        items: [
          {
            productId: "sku-keyboard-001",
            quantity: 2
          }
        ]
      })
    });

    const createBody = await createResponse.json();
    assert.equal(createResponse.status, 201);
    assert.equal(createBody.item.status, "accepted");
    assert.equal(createBody.item.total, 179.98);

    const listResponse = await fetch(`${baseUrl}/orders`);
    const listBody = await listResponse.json();
    assert.equal(listResponse.status, 200);
    assert.equal(listBody.items.length, 1);
    assert.equal(listBody.items[0].customerEmail, "buyer@example.com");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("GET /metrics exposes Prometheus counters after traffic", async () => {
  const { server, baseUrl } = await createTestServer();
  try {
    await fetch(`${baseUrl}/healthz`);
    const response = await fetch(`${baseUrl}/metrics`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /http_requests_total/);
    assert.match(body, /process_uptime_seconds/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("invalid order returns a 422 validation error", async () => {
  const { server, baseUrl } = await createTestServer();
  try {
    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        customerEmail: "",
        items: []
      })
    });

    const body = await response.json();
    assert.equal(response.status, 422);
    assert.match(body.message, /customerEmail is required/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
