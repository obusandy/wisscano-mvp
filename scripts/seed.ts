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
  { name: "Computer/Laptop Repair", slug: "computer-laptop-repair", sortOrder: 1 },
  { name: "Networking", slug: "networking", sortOrder: 2 },
  { name: "CCTV & Surveillance", slug: "cctv-surveillance", sortOrder: 3 },
  { name: "Printer Support", slug: "printer-support", sortOrder: 4 },
  { name: "Data Recovery", slug: "data-recovery", sortOrder: 5 },
  { name: "Software Installation", slug: "software-installation", sortOrder: 6 },
  { name: "IT Support", slug: "it-support", sortOrder: 7 },
  { name: "Other", slug: "other", sortOrder: 8 },
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