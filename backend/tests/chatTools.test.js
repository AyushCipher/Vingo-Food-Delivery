import { describe, it, expect, vi, beforeEach } from "vitest";

// The chat agent's order tools run inside a chat turn, not behind an Express
// route, so there's no middleware to reject an unauthenticated caller —
// these tests lock in that the tools themselves refuse to touch order data
// without a verified userId, and never return another user's order.

const { OrderMock } = vi.hoisted(() => ({
  OrderMock: { findById: vi.fn(), find: vi.fn() },
}));
vi.mock("../models/order.model.js", () => ({ default: OrderMock }));
vi.mock("../models/item.model.js", () => ({ default: { find: vi.fn() } }));
vi.mock("../models/shop.model.js", () => ({ default: { find: vi.fn() } }));

const { runTool } = await import("../services/chatTools.js");

describe("getOrderStatus tool", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses to run without an authenticated userId in context", async () => {
    const result = await runTool("getOrderStatus", { orderId: "order1" }, {});
    expect(result.error).toMatch(/signed in/i);
    expect(OrderMock.findById).not.toHaveBeenCalled();
  });

  it("returns an error instead of another user's order", async () => {
    OrderMock.findById.mockReturnValueOnce({
      populate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "order1",
          user: "someone_else",
          shopOrders: [],
        }),
      }),
    });
    const result = await runTool("getOrderStatus", { orderId: "order1" }, { userId: "me" });
    expect(result.error).toBeTruthy();
    expect(result.shops).toBeUndefined();
  });

  it("returns order details when the order belongs to the caller", async () => {
    OrderMock.findById.mockReturnValueOnce({
      populate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "order1",
          user: "me",
          paymentMethod: "cod",
          payment: false,
          createdAt: new Date(),
          shopOrders: [{ shop: { name: "Test Shop" }, status: "pending", items: [1], subtotal: 100 }],
        }),
      }),
    });
    const result = await runTool("getOrderStatus", { orderId: "order1" }, { userId: "me" });
    expect(result.error).toBeUndefined();
    expect(result.shops[0].shopName).toBe("Test Shop");
  });
});

describe("getOrderHistory tool", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses to run without an authenticated userId in context", async () => {
    const result = await runTool("getOrderHistory", {}, {});
    expect(result.error).toMatch(/signed in/i);
    expect(OrderMock.find).not.toHaveBeenCalled();
  });

  it("queries orders scoped to the caller's own userId", async () => {
    const sort = vi.fn().mockReturnThis();
    const limit = vi.fn().mockReturnThis();
    const populate = vi.fn().mockReturnThis();
    const lean = vi.fn().mockResolvedValue([]);
    OrderMock.find.mockReturnValueOnce({ populate, sort, limit, lean });

    await runTool("getOrderHistory", { limit: 5 }, { userId: "me" });

    expect(OrderMock.find).toHaveBeenCalledWith({ user: "me" });
  });
});

describe("runTool", () => {
  it("returns an error for an unknown tool name instead of throwing", async () => {
    const result = await runTool("deleteEverything", {}, { userId: "me" });
    expect(result.error).toMatch(/unknown tool/i);
  });
});
