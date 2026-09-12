import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup";
import Category from "@/models/Category";
import ServiceRequest from "@/models/ServiceRequest";

describe("Service request creation (integration)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it("creates a valid service request linked to an active category", async () => {
    const category = await Category.create({
      name: "IT Support",
      slug: "it-support",
      isActive: true,
      sortOrder: 1,
    });

    const request = await ServiceRequest.create({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      category: category._id,
      categoryNameSnapshot: category.name,
      description: "My laptop will not turn on after a power outage.",
      preferredContact: "EMAIL",
      status: "NEW",
    });

    expect(request._id).toBeDefined();
    expect(request.status).toBe("NEW");
    expect(request.categoryNameSnapshot).toBe("IT Support");
  });

  it("rejects a request missing a required field at the schema level", async () => {
    const category = await Category.create({
      name: "IT Support",
      slug: "it-support-2",
      isActive: true,
    });

    await expect(
      ServiceRequest.create({
        // fullName intentionally omitted
        email: "jane@example.com",
        phone: "+254712345678",
        category: category._id,
        categoryNameSnapshot: category.name,
        description: "Missing full name should fail validation.",
        preferredContact: "EMAIL",
      })
    ).rejects.toThrow();
  });

  it("preserves the category name snapshot even if the category is later renamed", async () => {
    const category = await Category.create({
      name: "Original Name",
      slug: "original-slug",
      isActive: true,
    });

    const request = await ServiceRequest.create({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      category: category._id,
      categoryNameSnapshot: category.name,
      description: "Testing category snapshot immutability behavior.",
      preferredContact: "EMAIL",
    });

    category.name = "Renamed Category";
    await category.save();

    const reloaded = await ServiceRequest.findById(request._id);
    expect(reloaded?.categoryNameSnapshot).toBe("Original Name");
  });
});
