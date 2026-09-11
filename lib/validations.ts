import { z } from "zod";
import { REQUEST_STATUSES, CONTACT_METHODS } from "@/models/ServiceRequest";

export const createRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number"),
  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category selected"),
  description: z
    .string()
    .trim()
    .min(10, "Please provide more detail (at least 10 characters)")
    .max(2000, "Description is too long (max 2000 characters)"),
  preferredContact: z.enum(CONTACT_METHODS, {
    message: "Please select a preferred contact method",
  }),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export const updateRequestSchema = z.object({
  status: z.enum(REQUEST_STATUSES).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().max(200).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/)
    .optional(),
  description: z.string().trim().min(10).max(2000).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const listRequestsQuerySchema = z.object({
  status: z.enum(REQUEST_STATUSES).optional(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;