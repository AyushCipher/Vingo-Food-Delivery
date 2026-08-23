import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema, googleAuthSchema } from "../validators/auth.validators.js";

describe("signUpSchema", () => {
  const validPayload = {
    fullName: "Ayush Verma",
    email: "Ayush@Example.com",
    password: "StrongP@ss1",
    role: "user",
    mobile: "9876543210",
  };

  it("accepts a valid signup payload and lowercases/trims the email", () => {
    const result = signUpSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("ayush@example.com");
  });

  it("rejects a password missing a special character", () => {
    const result = signUpSchema.safeParse({ ...validPayload, password: "NoSpecial1" });
    expect(result.success).toBe(false);
  });

  it("rejects a password under 8 characters", () => {
    const result = signUpSchema.safeParse({ ...validPayload, password: "Sh0rt!" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = signUpSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a role outside the allowed enum", () => {
    const result = signUpSchema.safeParse({ ...validPayload, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects a mobile number that is not 10 digits", () => {
    const result = signUpSchema.safeParse({ ...validPayload, mobile: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts email + non-empty password", () => {
    const result = signInSchema.safeParse({ email: "a@b.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("googleAuthSchema", () => {
  it("requires idToken", () => {
    const result = googleAuthSchema.safeParse({ role: "user" });
    expect(result.success).toBe(false);
  });

  it("accepts idToken alone (role/fullName optional for existing users)", () => {
    const result = googleAuthSchema.safeParse({ idToken: "abc.def.ghi" });
    expect(result.success).toBe(true);
  });
});
