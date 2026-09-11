/**
 * Idempotent seed script — safe to run multiple times.
 * Populates default service categories and creates the first
 * admin account if one doesn't already exist.
 *
 * Run with: npx tsx scripts/seed.ts
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Category from "../models/Category";
import Admin from "../models/Admin";

dotenv.config({ path: ".env" });

const DEFAULT_CATEGORIES = [
  { name: "IT Support", slug: "it-support", description: "General technical support and troubleshooting", sortOrder: 1 },
  { name: "Managed IT Services", slug: "managed-it-services", description: "Ongoing outsourced IT management", sortOrder: 2 },
  { name: "Network Deployment", slug: "network-deployment", description: "Routers, switches, wireless access points, structured cabling", sortOrder: 3 },
  { name: "Fiber Installation", slug: "fiber-installation", description: "Backbone and last-mile fiber installation", sortOrder: 4 },
  { name: "Server Solutions", slug: "server-solutions", description: "Servers, storage, and racking solutions", sortOrder: 5 },
  { name: "Cloud Services", slug: "cloud-services", description: "Migration, hosting, hybrid cloud, and backup", sortOrder: 6 },
  { name: "CCTV Installation", slug: "cctv-installation", description: "Surveillance, access control, and biometrics", sortOrder: 7 },
  { name: "Device Servicing", slug: "device-servicing", description: "Computer, laptop, and printer repair & maintenance", sortOrder: 8 },
  { name: "Cybersecurity Services", slug: "cybersecurity-services", description: "Security software, firewalls, and threat protection", sortOrder: 9 },
  { name: "Technology Consulting", slug: "technology-consulting", description: "Strategic IT and technology advisory", sortOrder: 10 },
  { name: "ICT Procurement", slug: "ict-procurement", description: "Sourcing hardware and equipment (Dell, HP, Cisco, etc.)", sortOrder: 11 },
  { name: "Data Recovery", slug: "data-recovery", description: "Recovery of lost or corrupted data", sortOrder: 12 },
  { name: "Software Installation", slug: "software-installation", description: "Installation and configuration of software", sortOrder: 13 },
  { name: "Other", slug: "other", description: "Anything not covered by the categories above", sortOrder: 14 },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not found in .env.local");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding...");

  // --- Seed Categories (idempotent: upsert by slug) ---
  for (const cat of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }
  console.log(`✅ Seeded ${DEFAULT_CATEGORIES.length} categories (upsert, no duplicates)`);

  // --- Seed Admin (idempotent: skip if email already exists) ---
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "⚠️  ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set in .env.local — skipping admin creation."
    );
  } else {
    const existing = await Admin.findOne({ email: adminEmail.toLowerCase() });
    if (existing) {
      console.log(`ℹ️  Admin ${adminEmail} already exists — skipping.`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await Admin.create({
        email: adminEmail.toLowerCase(),
        passwordHash,
        name: "Wisscano Admin",
        role: "ADMIN",
      });
      console.log(`✅ Created admin account: ${adminEmail}`);
    }
  }

  await mongoose.disconnect();
  console.log("Seeding complete. Disconnected.");
}

seed().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});