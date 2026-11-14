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
  { 
    name: "Cloud & Digital Infrastructure", 
    slug: "cloud-digital-infrastructure", 
    description: "Cloud hosting, VPS, domains, DNS, business email, migrations, backup and infrastructure management.", 
    sortOrder: 1 
  },
  { 
    name: "Websites & E-commerce", 
    slug: "websites-ecommerce", 
    description: "Business websites, online stores, web experiences, hosting and ongoing technical support.", 
    sortOrder: 2 
  },
  { 
    name: "Applications & Software", 
    slug: "applications-software", 
    description: "Custom web and mobile applications, business software, APIs and system integrations.", 
    sortOrder: 3 
  },
  { 
    name: "Automation & Cybersecurity", 
    slug: "automation-cybersecurity", 
    description: "Workflow automation, security integrations, data protection and operational continuity solutions.", 
    sortOrder: 4 
  },
  { 
    name: "Licences & Subscriptions", 
    slug: "licences-subscriptions", 
    description: "Genuine software licences and subscriptions for productivity, creative, cloud and business use.", 
    sortOrder: 5 
  },
  { 
    name: "Technical Support", 
    slug: "technical-support", 
    description: "Configuration, deployment, maintenance, troubleshooting and ongoing digital support.", 
    sortOrder: 6 
  },
  { 
    name: "Other", 
    slug: "other", 
    description: "Anything not covered by the categories above", 
    sortOrder: 7 
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not found in .env");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding...");

  // --- Seed Categories (upsert new/updated ones and clean up obsolete ones) ---
  const validSlugs = DEFAULT_CATEGORIES.map((cat) => cat.slug);

  // 1. Remove old categories no longer in the active list
  await Category.deleteMany({ slug: { $nin: validSlugs } });

  // 2. Upsert the current active categories
  for (const cat of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true }
    );
  }
  console.log(`✅ Seeded exactly ${DEFAULT_CATEGORIES.length} active categories (cleaned up old ones)`);

  // --- Seed Admin (idempotent: skip if email already exists) ---
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "⚠️  ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set in .env — skipping admin creation."
    );
  } else {
    const existing = await Admin.findOne({ email: adminEmail.toLowerCase() });
    if (existing) {
      console.log(` Admin ${adminEmail} already exists — skipping.`);
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