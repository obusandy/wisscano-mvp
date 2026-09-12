import { describe, it, expect } from "vitest";
import { createRequestSchema } from "@/lib/validations";

describe("createRequestSchema", () => {
  it("accepts a valid service request payload", () => {
    const validInput = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      categoryId: "507f1f77bcf86cd799439011",
      description: "My laptop will not turn on after a power outage.",
      preferredContact: "EMAIL",
    };

    const result = createRequestSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it("rejects a request with an invalid email", () => {
    const invalidInput = {
      fullName: "Jane Doe",
      email: "not-an-email",
      phone: "+254712345678",
      categoryId: "507f1f77bcf86cd799439011",
      description: "My laptop will not turn on.",
      preferredContact: "EMAIL",
    };

    const result = createRequestSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects a request with a description that is too short", () => {
    const invalidInput = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      categoryId: "507f1f77bcf86cd799439011",
      description: "short",
      preferredContact: "EMAIL",
    };

    const result = createRequestSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toBeDefined();
    }
  });

  it("rejects a request with a malformed category ID", () => {
    const invalidInput = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      categoryId: "not-a-valid-object-id",
      description: "My laptop will not turn on after a power outage.",
      preferredContact: "EMAIL",
    };

    const result = createRequestSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.categoryId).toBeDefined();
    }
  });

  it("rejects an invalid preferred contact method", () => {
    const invalidInput = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      categoryId: "507f1f77bcf86cd799439011",
      description: "My laptop will not turn on after a power outage.",
      preferredContact: "FAX",
    };

    const result = createRequestSchema.safeParse(invalidInput);

    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createRequestSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.fullName).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.categoryId).toBeDefined();
    }
  });
});
