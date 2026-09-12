import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rateLimit";

describe("Rate limiter", () => {
  it("allows requests within the configured limit", () => {
    const identifier = `test-allow-${Date.now()}`;

    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(identifier, {
        windowMs: 60000,
        maxRequests: 5,
      });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests once the limit is exceeded", () => {
    const identifier = `test-block-${Date.now()}`;

    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, { windowMs: 60000, maxRequests: 5 });
    }

    const sixthAttempt = checkRateLimit(identifier, {
      windowMs: 60000,
      maxRequests: 5,
    });

    expect(sixthAttempt.allowed).toBe(false);
  });

  it("tracks separate identifiers independently", () => {
    const idA = `test-a-${Date.now()}`;
    const idB = `test-b-${Date.now()}`;

    for (let i = 0; i < 5; i++) {
      checkRateLimit(idA, { windowMs: 60000, maxRequests: 5 });
    }

    const resultA = checkRateLimit(idA, { windowMs: 60000, maxRequests: 5 });
    const resultB = checkRateLimit(idB, { windowMs: 60000, maxRequests: 5 });

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });
});
