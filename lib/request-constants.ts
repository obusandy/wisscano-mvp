export const REQUEST_STATUSES = [
  "NEW",
  "REVIEWING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const CONTACT_METHODS = ["EMAIL", "PHONE"] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number];
