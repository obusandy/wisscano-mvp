import mongoose from "mongoose";
import CatalogItem from "../models/CatalogItem";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const items = [
  // --- SERVICES (01 to 06) ---
  {
    type: "service",
    name: "Cloud & Hosting",
    slug: "cloud-hosting",
    description: "Website hosting, cloud infrastructure, deployment environments and ongoing digital support.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop",
    sectorTags: ["ict-digital"],
    order: 1,
    active: true,
  },
  {
    type: "service",
    name: "Domains & Business Email",
    slug: "domains-email",
    description: "Domain registration, professional email setup, and website and email migrations.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop",
    sectorTags: ["ict-digital"],
    order: 2,
    active: true,
  },
  {
    type: "service",
    name: "Website Rentals",
    slug: "website-rentals",
    description: "Professional, ready-to-use business websites available through flexible rental arrangements.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop",
    sectorTags: ["ict-digital"],
    order: 3,
    active: true,
  },
  {
    type: "service",
    name: "Custom Software Development",
    slug: "custom-software",
    description: "Custom websites, web and mobile applications, APIs, integrations and business software.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop",
    sectorTags: ["ict-digital"],
    order: 4,
    active: true,
  },
  {
    type: "service",
    name: "Software Licences & Subscriptions",
    slug: "licences-subscriptions",
    description: "Genuine productivity, creative, cloud and business software licences and subscriptions.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop",
    sectorTags: ["ict-digital"],
    order: 5,
    active: true,
  },
  {
    type: "service",
    name: "Cybersecurity & Data Protection",
    slug: "cybersecurity-data-protection",
    description: "Endpoint protection, security, backup, recovery and data-protection solutions.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop",
    sectorTags: ["ict-digital", "facility-tech"],
    order: 6,
    active: true,
  },

  // --- PARTNER PRODUCTS (HP, Logitech, Microsoft, Kaspersky, Bitdefender, Acronis) ---
  {
    type: "product",
    name: "HP ProBook 450 G10",
    slug: "hp-probook-450-g10",
    description: "Intel Core i7, 16GB RAM, 512GB NVMe SSD, Windows 11 Pro, 3-Year Onsite Warranty.",
    brand: "HP",
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital"],
    active: true,
  },
  {
    type: "product",
    name: "HP LaserJet Pro MFP 4103fdw",
    slug: "hp-laserjet-pro-mfp",
    description: "High-speed monochrome duplex print, scan, copy with enterprise security features.",
    brand: "HP",
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital", "facility-tech"],
    active: true,
  },
  {
    type: "product",
    name: "Logitech Rally Bar",
    slug: "logitech-rally-bar",
    description: "All-in-one AI video conferencing bar for medium-to-large boardrooms (Teams/Zoom certified).",
    brand: "Logitech",
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital"],
    active: true,
  },
  {
    type: "product",
    name: "Logitech MX Master 3S & Zone Vibe",
    slug: "logitech-mx-master-bundle",
    description: "Precision wireless ergonomic mouse and noise-canceling wireless headset bundle.",
    brand: "Logitech",
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital"],
    active: true,
  },
  {
    type: "product",
    name: "Microsoft 365 Business Standard",
    slug: "microsoft-365-business",
    description: "Official commercial cloud tenant licensing, desktop apps, Exchange email, and Teams.",
    brand: "Microsoft",
    category: "Licences",
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital"],
    active: true,
  },
  {
    type: "product",
    name: "Windows Server 2022 Standard",
    slug: "windows-server-2022",
    description: "Core-based server licensing and Client Access Licences (CALs) for on-prem/hybrid setup.",
    brand: "Microsoft",
    category: "Licences",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital", "power-energy"],
    active: true,
  },
  {
    type: "product",
    name: "Kaspersky Endpoint Security for Business",
    slug: "kaspersky-endpoint-security",
    description: "Centralized multi-layered ransomware defense, device control, and patch management.",
    brand: "Kaspersky",
    category: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital", "facility-tech"],
    active: true,
  },
  {
    type: "product",
    name: "Kaspersky Next EDR Optimum",
    slug: "kaspersky-next-edr",
    description: "Automated root-cause analysis and cloud-sandbox threat detection for enterprise teams.",
    brand: "Kaspersky",
    category: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital"],
    active: true,
  },
  {
    type: "product",
    name: "Bitdefender GravityZone Business Security",
    slug: "bitdefender-gravityzone",
    description: "Next-gen endpoint protection with minimal system footprint and unified cloud console.",
    brand: "Bitdefender",
    category: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital", "facility-tech"],
    active: true,
  },
  {
    type: "product",
    name: "Acronis Cyber Protect Cloud",
    slug: "acronis-cyber-protect",
    description: "Unified backup, disaster recovery, and next-gen AI anti-malware protection.",
    brand: "Acronis",
    category: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
    price: 1500,
    currency: "KES",
    sectorTags: ["ict-digital"],
    active: true,
  },
];

async function seedCatalog() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB for catalog seeding...");

    for (const item of items) {
      await CatalogItem.updateOne(
        { slug: item.slug },
        { $set: item },
        { upsert: true }
      );
    }

    console.log(`✅ Successfully seeded ${items.length} catalog items (Products & Services)!`);
  } catch (error) {
    console.error("Catalog seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedCatalog();