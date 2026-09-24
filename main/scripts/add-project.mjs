/**
 * scripts/add-project.mjs
 * -------------------------------------------------------------------------
 * Seed a Project (garden transformation + outdoor kitchen) into MongoDB.
 * Image fields are left blank — upload the 6 photos in the dashboard
 * (Projects -> edit -> thumbnail / hero / gallery).
 *
 * Idempotent: keyed on slug.  Run:  node scripts/add-project.mjs
 * -------------------------------------------------------------------------
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > -1 && !(t.slice(0, i).trim() in process.env))
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

const emptyImg = { url: "", publicId: "", alt: "" };

const PROJECT = {
  slug: "garden-transformation-outdoor-kitchen",
  title: "Garden Transformation & Outdoor Kitchen",
  shortDescription:
    "A complete rear-garden rebuild in London — new slatted timber screening with integrated lighting, a rendered raised planting border, a fully prepared lawn base, and a covered outdoor kitchen with a pizza oven and BBQ.",
  category: "Landscaping & Outdoor",
  client: "",
  location: "London",
  status: "draft",
  featured: true,
  displayOrder: 1,
  completedAt: new Date("2026-03-20"),
  duration: "6 weeks",

  thumbnail: { ...emptyImg },
  heroImage: { ...emptyImg },
  gallery: [],

  overview: {
    title: "Overview",
    content:
      "A tired rear garden was stripped back and rebuilt as a low-maintenance entertaining space. We installed new slatted timber screening around the full perimeter with recessed warm-white wall lights and a continuous LED strip along the raised border, built and rendered a raised planting bed with a crisp white capping detail, re-graded and prepared the central lawn area ready for turf, and constructed a covered outdoor kitchen housing a pizza oven, BBQ and prep run. Building, groundwork, joinery and electrical work were all delivered by one team.",
  },

  challenges: {
    title: "Challenges",
    items: [
      "Uneven, waterlogged ground across the whole garden needing full re-grading and drainage falls.",
      "Running weatherproof power and data for perimeter lighting, LED strips and the outdoor kitchen without visible cabling.",
      "Tying the new covered kitchen structure into an existing garden room and boundary levels.",
      "Keeping the site tidy and safe with an occupied house throughout.",
    ],
  },

  solutions: {
    title: "Solutions",
    items: [
      "Excavated, levelled and compacted the lawn area with correct falls, then laid a fine soil base ready for turf.",
      "Built a rendered raised border with a white capping, planted with a specimen tree and shrubs.",
      "Fitted slatted timber screening the full perimeter with recessed IP-rated wall lights and a concealed LED strip along the bed edge.",
      "Constructed a covered outdoor kitchen with a pizza oven, BBQ and worktop run, on a dedicated circuit with weatherproof sockets.",
      "First-fixed all external wiring before the screening went up so nothing is visible.",
    ],
  },

  results: {
    title: "Results",
    items: [
      "A clean, usable garden that works year-round, day and night.",
      "Layered lighting — wall lights, LED border strip and kitchen task lighting — all zoned and switchable.",
      "A weatherproof outdoor kitchen ready for entertaining.",
      "Lawn area prepared and ready for turf, with proper drainage falls.",
    ],
  },

  technologies: [
    "Slatted timber perimeter screening",
    "Recessed IP-rated wall lights",
    "Concealed LED strip lighting",
    "Rendered raised bed construction",
    "Ground re-grading & drainage falls",
    "Covered outdoor kitchen build",
    "Pizza oven & BBQ installation",
    "External weatherproof electrics",
  ],

  projectDetails: [
    { label: "Project Type", value: "Garden transformation & outdoor kitchen" },
    { label: "Location", value: "London" },
    { label: "Scope", value: "Groundwork, joinery, landscaping & electrics" },
    { label: "Timeline", value: "6 weeks" },
  ],

  cta: {
    title: "Planning a garden project?",
    content:
      "Tell us how you'd like to use the space and we'll come back with next steps, free of charge.",
    buttonLabel: "Get a free quote",
    buttonHref: "/contact#quote",
  },

  seo: {
    metaTitle: "Garden Transformation & Outdoor Kitchen in London | BSL Construction",
    metaDescription:
      "A full rear-garden rebuild in London — slatted timber screening with integrated lighting, a rendered raised border, a prepared lawn base and a covered outdoor kitchen with pizza oven.",
    keywords: [
      "garden transformation london",
      "outdoor kitchen london",
      "landscaping london",
      "garden lighting installation",
      "slatted fencing london",
      "raised bed construction",
      "pizza oven installation london",
    ],
  },
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const col = mongoose.connection.collection("projects");
  const now = new Date();

  const existing = await col.findOne({ slug: PROJECT.slug });
  if (existing) {
    await col.updateOne(
      { _id: existing._id },
      { $set: { ...PROJECT, updatedAt: now } },
    );
    console.log(`Updated project "${PROJECT.title}" (/projects/${PROJECT.slug})`);
  } else {
    const res = await col.insertOne({ ...PROJECT, createdAt: now, updatedAt: now, __v: 0 });
    console.log(
      `Inserted project "${PROJECT.title}" (/projects/${PROJECT.slug}) — _id ${res.insertedId}`,
    );
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
