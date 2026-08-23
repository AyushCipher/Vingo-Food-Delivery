import { describe, it, expect, vi, beforeEach } from "vitest";

// verifyRazorpay is the fix for a real bug: the original code only checked
// payment.status === "captured" and never tied the payment back to the
// specific order (its razorpayOrderId/amount) or checked for reuse, so a
// payment captured for a cheap order could be replayed against a more
// expensive one. These tests lock in every guard that closes that gap.

const { paymentsFetch, OrderMock, UserMock, ShopMock } = vi.hoisted(() => ({
  paymentsFetch: vi.fn(),
  OrderMock: { findById: vi.fn(), findOne: vi.fn() },
  UserMock: { findById: vi.fn() },
  ShopMock: { findById: vi.fn() },
}));

// Arrow functions aren't constructible, and the code does `new Razorpay(...)`,
// so the mock needs a real function — one that returns an object, which `new`
// then uses in place of `this`.
vi.mock("razorpay", () => ({
  default: function Razorpay() {
    return {
      orders: { create: vi.fn() },
      payments: { fetch: paymentsFetch },
    };
  },
}));

vi.mock("../config/mail.js", () => ({
  sendOtpToUser: vi.fn(),
  sendOrderConfirmationToCustomer: vi.fn().mockResolvedValue(undefined),
  sendOrderNotificationToOwner: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../models/order.model.js", () => ({ default: OrderMock }));
vi.mock("../models/user.model.js", () => ({ default: UserMock }));
vi.mock("../models/shop.model.js", () => ({ default: ShopMock }));

const { verifyRazorpay } = await import("../controllers/order.controller.js");

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides = {}) => ({
  body: { razorpay_payment_id: "pay_123", orderId: "order_1" },
  userId: "user_1",
  app: { get: () => null },
  ...overrides,
});

const baseOrder = () => ({
  _id: { toString: () => "order_1" },
  user: { toString: () => "user_1" },
  paymentMethod: "online",
  payment: false,
  razorpayOrderId: "razorpay_order_1",
  totalAmount: 500,
  shopOrders: [{ status: "pending", owner: { toString: () => "owner_1" }, shop: { toString: () => "shop_1" } }],
  save: vi.fn().mockResolvedValue(undefined),
});

describe("verifyRazorpay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when razorpay_payment_id or orderId is missing", async () => {
    const req = makeReq({ body: { orderId: "order_1" } });
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when the order does not exist", async () => {
    OrderMock.findById.mockResolvedValueOnce(null);
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 403 when the order belongs to a different user", async () => {
    OrderMock.findById.mockResolvedValueOnce({ ...baseOrder(), user: { toString: () => "someone_else" } });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(paymentsFetch).not.toHaveBeenCalled();
  });

  it("returns 400 when the order is not an online-payment order", async () => {
    OrderMock.findById.mockResolvedValueOnce({ ...baseOrder(), paymentMethod: "cod" });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("short-circuits with 200 when the order is already marked paid (no reprocessing)", async () => {
    OrderMock.findById.mockResolvedValueOnce({ ...baseOrder(), payment: true });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(paymentsFetch).not.toHaveBeenCalled();
  });

  it("returns 400 when the Razorpay payment is not captured", async () => {
    OrderMock.findById.mockResolvedValueOnce(baseOrder());
    paymentsFetch.mockResolvedValueOnce({ status: "failed" });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when the payment's order_id does not match this order's razorpayOrderId (replay across orders)", async () => {
    OrderMock.findById.mockResolvedValueOnce(baseOrder());
    paymentsFetch.mockResolvedValueOnce({
      status: "captured",
      order_id: "a_totally_different_razorpay_order",
      amount: 50000,
    });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when the captured amount does not match the order total", async () => {
    OrderMock.findById.mockResolvedValueOnce(baseOrder());
    paymentsFetch.mockResolvedValueOnce({
      status: "captured",
      order_id: "razorpay_order_1",
      amount: 100, // order total is 500 -> 50000 paise expected
    });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when the payment id is already attached to a different order", async () => {
    OrderMock.findById.mockResolvedValueOnce(baseOrder());
    paymentsFetch.mockResolvedValueOnce({
      status: "captured",
      order_id: "razorpay_order_1",
      amount: 50000,
    });
    OrderMock.findOne.mockResolvedValueOnce({ _id: { toString: () => "some_other_order" } });
    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("verifies and marks the order paid when everything matches", async () => {
    const order = baseOrder();
    OrderMock.findById
      .mockResolvedValueOnce(order) // initial lookup
      .mockReturnValueOnce({
        // populated re-fetch for emails/sockets
        populate: vi.fn().mockReturnThis(),
        then: (resolve) =>
          resolve({
            _id: order._id,
            user: { fullName: "Ayush", email: "a@b.com" },
            shopOrders: order.shopOrders,
            address: {},
            paymentMethod: "online",
            createdAt: new Date(),
          }),
      });
    paymentsFetch.mockResolvedValueOnce({
      status: "captured",
      order_id: "razorpay_order_1",
      amount: 50000,
    });
    OrderMock.findOne.mockResolvedValueOnce(null);
    UserMock.findById.mockResolvedValueOnce({ orders: [], save: vi.fn().mockResolvedValue(undefined) });
    ShopMock.findById.mockReturnValueOnce({ populate: vi.fn().mockResolvedValue(null) });

    const req = makeReq();
    const res = makeRes();

    await verifyRazorpay(req, res);

    expect(order.payment).toBe(true);
    expect(order.razorpayPaymentId).toBe("pay_123");
    expect(order.save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
