import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup";
import Admin from "@/models/Admin";
import { loginSchema } from "@/lib/validations";

describe("Admin authentication security", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it("does not return passwordHash by default when querying an admin", async () => {
    await Admin.create({
      email: "admin@wisscano.com",
      passwordHash: await bcrypt.hash("SuperSecret123!", 12),
      name: "Test Admin",
      role: "ADMIN",
    });

    const found = await Admin.findOne({ email: "admin@wisscano.com" });

    // passwordHash has `select: false` in the schema — should be
    // undefined unless explicitly requested with .select("+passwordHash")
    expect(found?.passwordHash).toBeUndefined();
  });

  it("correctly verifies a valid password against its hash", async () => {
    const plainPassword = "SuperSecret123!";
    await Admin.create({
      email: "admin@wisscano.com",
      passwordHash: await bcrypt.hash(plainPassword, 12),
      name: "Test Admin",
      role: "ADMIN",
    });

    const admin = await Admin.findOne({ email: "admin@wisscano.com" }).select(
      "+passwordHash"
    );

    const isValid = await admin!.comparePassword(plainPassword);
    const isInvalid = await admin!.comparePassword("WrongPassword");

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it("rejects a login payload with an invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "SuperSecret123!",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a login payload with a too-short password", () => {
    const result = loginSchema.safeParse({
      email: "admin@wisscano.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("stores emails in lowercase to prevent case-sensitive duplicate accounts", async () => {
    await Admin.create({
      email: "Admin@Wisscano.com",
      passwordHash: await bcrypt.hash("SuperSecret123!", 12),
      name: "Test Admin",
      role: "ADMIN",
    });

    const found = await Admin.findOne({ email: "admin@wisscano.com" });
    expect(found).not.toBeNull();
  });
});
