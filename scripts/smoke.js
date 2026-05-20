const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";

async function expectJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json();
  return { response, body };
}

async function main() {
  const health = await expectJson("/healthz");
  if (health.response.status !== 200) {
    throw new Error(`/healthz returned ${health.response.status}`);
  }

  const createOrder = await expectJson("/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      customerEmail: "smoke@example.com",
      items: [
        {
          productId: "sku-keyboard-001",
          quantity: 1
        }
      ]
    })
  });

  if (createOrder.response.status !== 201) {
    throw new Error(`/orders returned ${createOrder.response.status}`);
  }

  const metricsResponse = await fetch(`${baseUrl}/metrics`);
  const metricsBody = await metricsResponse.text();
  if (!metricsBody.includes("orders_created_total")) {
    throw new Error("orders_created_total is missing from /metrics");
  }

  console.log("Smoke test passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
