import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup";
import Category from "@/models/Category";
import ServiceRequest from "@/models/ServiceRequest";
import Admin from "@/models/Admin";
import AuditLog from "@/models/AuditLog";
import { updateServiceRequest, cancelServiceRequest } from "@/lib/request-detail-service";

describe("Admin status updates and audit trail (integration)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  async function seedRequestAndAdmin() {
    const category = await Category.create({
      name: "IT Support",
      slug: "it-support",
      isActive: true,
    });

    const request = await ServiceRequest.create({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+254712345678",
      category: category._id,
      categoryNameSnapshot: category.name,
      description: "Test request for status update flow.",
      preferredContact: "EMAIL",
      status: "NEW",
    });

    const admin = await Admin.create({
      email: "admin@wisscano.com",
      passwordHash: "irrelevant-for-this-test",
      name: "Test Admin",
      role: "ADMIN",
    });

    return { request, admin };
  }

  it("allows an admin to change a request's status", async () => {
    const { request, admin } = await seedRequestAndAdmin();

    const result = await updateServiceRequest(
      request._id.toString(),
      { status: "REVIEWING" },
      admin._id.toString(),
      admin.email
    );

    expect(result.notFound).toBe(false);

    const updated = await ServiceRequest.findById(request._id);
    expect(updated?.status).toBe("REVIEWING");
  });

  it("records an audit log entry when status changes", async () => {
    const { request, admin } = await seedRequestAndAdmin();

    await updateServiceRequest(
      request._id.toString(),
      { status: "IN_PROGRESS" },
      admin._id.toString(),
      admin.email
    );

    const logs = await AuditLog.find({ requestId: request._id });

    expect(logs.length).toBe(1);
    expect(logs[0].field).toBe("status");
    expect(logs[0].previousValue).toBe("NEW");
    expect(logs[0].newValue).toBe("IN_PROGRESS");
    expect(logs[0].changedByEmail).toBe(admin.email);
    expect(logs[0].action).toBe("STATUS_CHANGE");
  });

  it("does not create an audit entry when no fields actually change", async () => {
    const { request, admin } = await seedRequestAndAdmin();

    // Setting status to its current value — no real change
    await updateServiceRequest(
      request._id.toString(),
      { status: "NEW" },
      admin._id.toString(),
      admin.email
    );

    const logs = await AuditLog.find({ requestId: request._id });
    expect(logs.length).toBe(0);
  });

  it("records multiple audit entries for multiple status changes over time", async () => {
    const { request, admin } = await seedRequestAndAdmin();

    await updateServiceRequest(
      request._id.toString(),
      { status: "REVIEWING" },
      admin._id.toString(),
      admin.email
    );
    await updateServiceRequest(
      request._id.toString(),
      { status: "IN_PROGRESS" },
      admin._id.toString(),
      admin.email
    );
    await updateServiceRequest(
      request._id.toString(),
      { status: "COMPLETED" },
      admin._id.toString(),
      admin.email
    );

    const logs = await AuditLog.find({ requestId: request._id }).sort({
      changedAt: 1,
    });

    expect(logs.length).toBe(3);
    expect(logs.map((l) => l.newValue)).toEqual([
      "REVIEWING",
      "IN_PROGRESS",
      "COMPLETED",
    ]);
  });

  it("soft-cancels a request instead of deleting it, and logs the cancellation", async () => {
    const { request, admin } = await seedRequestAndAdmin();

    const result = await cancelServiceRequest(
      request._id.toString(),
      admin._id.toString(),
      admin.email
    );

    expect(result.notFound).toBe(false);

    const stillExists = await ServiceRequest.findById(request._id);
    expect(stillExists).not.toBeNull();
    expect(stillExists?.status).toBe("CANCELLED");

    const logs = await AuditLog.find({ requestId: request._id });
    expect(logs.some((l) => l.action === "CANCEL")).toBe(true);
  });

  it("returns notFound for a non-existent request ID", async () => {
    const { admin } = await seedRequestAndAdmin();
    const fakeId = "507f1f77bcf86cd799439011";

    const result = await updateServiceRequest(
      fakeId,
      { status: "REVIEWING" },
      admin._id.toString(),
      admin.email
    );

    expect(result.notFound).toBe(true);
  });
});
