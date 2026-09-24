/**
 * scripts/add-project-essence.mjs
 * -------------------------------------------------------------------------
 * Seed the "Essence" commercial interior fit-out project into MongoDB.
 * Image fields are left blank — upload the photos in the dashboard
 * (Projects -> edit -> thumbnail / hero / gallery), then Publish.
 *
 * Idempotent: keyed on slug.  Run:  node scripts/add-project-essence.mjs
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
  slug: "two-storey-extension-whole-house-remodel",
  title: "Two-Storey Extension & Whole-House Remodel",
  shortDescription:
    "A major transformation of a detached family home in London \u2014 a new rear extension with bi-fold doors and roof lanterns, an added second-floor storey, a full internal remodel with an open-plan kitchen/living space, new render, windows, roof and a porcelain-paved terrace.",
  category: "Construction",
  client: "",
  location: "London",
  status: "draft",
  featured: true,
  displayOrder: 5,
  completedAt: new Date("2025-11-15"),
  duration: "20 weeks",

  thumbnail: { ...emptyImg },
  heroImage: { ...emptyImg },
  gallery: [],

  overview: {
    title: "Overview",
    content:
      "The house was extended and remodelled top to bottom. We built a full-width single-storey rear extension with aluminium bi-fold doors and two roof lanterns opening onto a new porcelain-paved terrace with a drainage channel, and added a second-floor storey with multiple gables under a new tiled roof. Internally, walls came down to form a large open-plan kitchen, dining and living space with a hand-painted in-frame shaker kitchen, granite worktops and island, a slat-panel and marble TV feature wall, layered LED cove and recessed lighting, and polished marble-effect porcelain flooring throughout the ground floor. The exterior was re-rendered white with anthracite aluminium windows, and the whole house was rewired and replumbed. Structural, building, joinery, M&E, tiling, decoration and landscaping were all delivered by one team.",
  },

  challenges: {
    title: "Challenges",
    items: [
      "Adding a full storey and a large extension to a substantial property while keeping the structure sound throughout.",
      "Coordinating steelwork, roof lanterns and bi-fold openings so the ground floor reads as one uninterrupted space.",
      "Managing Building Control, Party Wall and structural sign-off across the extension, new storey and internal openings.",
      "Sequencing a full remodel \u2014 rewire, replumb, plaster, flooring, kitchen, decoration and external works \u2014 to one programme.",
    ],
  },

  solutions: {
    title: "Solutions",
    items: [
      "Installed structural steel frames for the new storey and every internal opening, all designed and signed off by a structural engineer.",
      "Formed the rear extension with a flat roof carrying two lanterns and a run of bi-folds for maximum light and garden connection.",
      "Laid large-format marble-effect porcelain from a central grid so veining runs continuously through the whole ground floor.",
      "Built the kitchen and TV feature wall as bespoke joinery, with granite templated and fitted after second fix.",
      "Re-rendered the exterior, replaced all windows in anthracite aluminium, re-roofed the new storey, and paved the terrace with a linear drain.",
    ],
  },

  results: {
    title: "Results",
    items: [
      "A significantly larger, lighter home with a true open-plan living, kitchen and dining space.",
      "An added floor of accommodation under a new roof, fully integrated with the existing house.",
      "A high-specification finish \u2014 bespoke kitchen, granite, marble-effect porcelain and layered lighting throughout.",
      "A weatherproofed, re-rendered exterior with a new terrace, delivered by one accountable contractor.",
    ],
  },

  technologies: [
    "Structural steelwork",
    "Single-storey rear extension",
    "Second-floor storey addition",
    "New tiled roof",
    "Roof lanterns",
    "Aluminium bi-fold doors",
    "Anthracite aluminium windows",
    "White through-coloured render",
    "Open-plan structural openings",
    "Bespoke in-frame shaker kitchen",
    "Granite worktops",
    "Slat-panel & marble feature wall",
    "Large-format marble-effect porcelain flooring",
    "LED cove & recessed lighting",
    "Full rewire & replumb",
    "Porcelain terrace paving with linear drainage",
    "Specialist decoration",
  ],

  projectDetails: [
    { label: "Project Type", value: "Two-storey extension & full remodel" },
    { label: "Location", value: "London" },
    { label: "Scope", value: "Structural, building, roofing, M&E, joinery, tiling, decoration & landscaping" },
    { label: "Timeline", value: "20 weeks" },
  ],

  cta: {
    title: "Planning an extension or remodel?",
    content:
      "Tell us about the property and what you'd like to achieve \u2014 we'll come back with next steps, free of charge.",
    buttonLabel: "Get a free quote",
    buttonHref: "/contact#quote",
  },

  seo: {
    metaTitle: "Two-Storey Extension & Whole-House Remodel in London | BSL Construction",
    metaDescription:
      "A major London home transformation \u2014 a rear extension with bi-folds and roof lanterns, an added second storey, an open-plan kitchen/living remodel, new render, windows, roof and terrace.",
    keywords: [
      "house extension london",
      "two storey extension london",
      "rear extension london",
      "loft storey addition",
      "open plan kitchen extension",
      "whole house remodel london",
      "roof lantern installation",
      "bi-fold door installation london",
    ],
  },
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const col = mongoose.connection.collection("projects");
  const now = new Date();

  const existing = await col.findOne({ slug: PROJECT.slug });
  if (existing) {
    await col.updateOne({ _id: existing._id }, { $set: { ...PROJECT, updatedAt: now } });
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
