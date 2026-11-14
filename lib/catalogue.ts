export const PLACEHOLDER_PRICE = 1500;

export const SECTORS = [
  {
    slug: "ict-digital",
    label: "ICT & Digital",
    categories: [
      "Structured cabling",
      "Networking equipment",
      "Wi-Fi systems",
      "Internet connectivity and backup",
      "Servers, storage, and backup",
      "Business telephony",
      "Point-of-sale and hospitality systems",
      "End-user devices",
      "Digital presence and platforms",
      "Software and licences",
      "Cybersecurity and endpoint protection",
    ],
  },
  {
    slug: "facility-tech",
    label: "Facility Tech",
    categories: [
      "CCTV",
      "Access control",
      "Fire detection and alarm",
      "Intruder alarms",
      "Intercoms and video door phones",
      "Public address and voice evacuation",
      "Building controls and system integration",
      "Gates, boom barriers, and parking systems",
    ],
  },
  {
    slug: "power-energy",
    label: "Power & Energy",
    categories: [
      "UPS (uninterruptible power supply)",
      "Generators and automatic transfer switches",
      "Solar PV and hybrid systems",
      "Batteries and energy storage",
      "Distribution boards, surge protection, and earthing",
      "Metering and energy monitoring",
      "Energy audits and efficiency",
    ],
  },
] as const;

export type SectorSlug = (typeof SECTORS)[number]["slug"];

export const sectorBySlug = (slug?: string) =>
  SECTORS.find((s) => s.slug === slug);