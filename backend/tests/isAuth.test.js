import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import isAuth from "../middlewares/isAuth.js";

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("isAuth middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("rejects with 401 when no token cookie is present", async () => {
    const req = { cookies: {} };
    const res = makeRes();
    const next = vi.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects with 401 when the token is invalid/expired", async () => {
    const req = { cookies: { token: "not-a-real-jwt" } };
    const res = makeRes();
    const next = vi.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.userId and calls next() for a valid token", async () => {
    const token = jwt.sign({ userId: "user123" }, process.env.JWT_SECRET);
    const req = { cookies: { token } };
    const res = makeRes();
    const next = vi.fn();

    await isAuth(req, res, next);

    expect(req.userId).toBe("user123");
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
