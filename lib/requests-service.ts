import { connectDB } from "@/lib/db";
import ServiceRequest from "@/models/ServiceRequest";
import { listRequestsQuerySchema } from "@/lib/validations";

export type ServiceRequestDTO = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  categoryNameSnapshot: string;
  description: string;
  preferredContact: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Converts a Mongoose lean() document into a plain, JSON-safe object.
 * Ensures consistent shape whether data is consumed by a Server
 * Component (rendered directly) or the API route (JSON response).
 */
function serialize(doc: Record<string, unknown>): ServiceRequestDTO {
  return {
    _id: String(doc._id),
    fullName: doc.fullName as string,
    email: doc.email as string,
    phone: doc.phone as string,
    categoryNameSnapshot: doc.categoryNameSnapshot as string,
    description: doc.description as string,
    preferredContact: doc.preferredContact as string,
    status: doc.status as string,
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}

/**
 * Strips empty-string query params before validation. Native HTML
 * <select> "All statuses" options submit as status="" rather than
 * omitting the key entirely — without this cleanup, Zod's enum
 * validation would reject an empty string as an invalid status.
 */
function cleanQuery(
  raw: Record<string, string | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim() !== "") {
      result[key] = value;
    }
  }
  return result;
}

export async function listServiceRequests(
  rawQuery: Record<string, string | undefined>
) {
  const query = listRequestsQuerySchema.parse(cleanQuery(rawQuery));

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.search) filter.$text = { $search: query.search };

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    ServiceRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    ServiceRequest.countDocuments(filter),
  ]);

  return {
    items: items.map((doc) => serialize(doc as unknown as Record<string, unknown>)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
