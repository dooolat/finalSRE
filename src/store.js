import { randomUUID } from "node:crypto";
import { catalog } from "./catalog.js";

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

export class OrderStore {
  constructor(products = catalog) {
    this.products = products;
    this.orders = [];
    this.productIndex = new Map(products.map((product) => [product.id, product]));
  }

  getProducts() {
    return this.products;
  }

  listOrders() {
    return this.orders;
  }

  createOrder(input) {
    const customerEmail = input?.customerEmail?.trim();
    const items = Array.isArray(input?.items) ? input.items : [];

    if (!customerEmail) {
      throw new Error("customerEmail is required");
    }

    if (items.length === 0) {
      throw new Error("at least one order item is required");
    }

    const normalizedItems = items.map((item) => {
      const product = this.productIndex.get(item?.productId);
      const quantity = Number.parseInt(item?.quantity ?? "", 10);

      if (!product) {
        throw new Error(`unknown productId: ${item?.productId}`);
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error(`invalid quantity for productId: ${item?.productId}`);
      }

      return {
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        lineTotal: roundMoney(product.price * quantity)
      };
    });

    const total = roundMoney(
      normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );

    const order = {
      id: randomUUID(),
      customerEmail,
      currency: "USD",
      status: "accepted",
      createdAt: new Date().toISOString(),
      items: normalizedItems,
      total
    };

    this.orders.push(order);
    return order;
  }
}
