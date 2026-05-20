from locust import HttpUser, between, task


class OrdersUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def browse_products(self):
        self.client.get("/products", name="GET /products")

    @task(1)
    def create_order(self):
        payload = {
            "customerEmail": "loadtest@example.com",
            "items": [
                {
                    "productId": "sku-keyboard-001",
                    "quantity": 1
                },
                {
                    "productId": "sku-mouse-002",
                    "quantity": 1
                }
            ]
        }
        self.client.post("/orders", json=payload, name="POST /orders")
