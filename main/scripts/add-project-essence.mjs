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
  slug: "essence-commercial-fit-out",
  title: "Essence — Commercial Interior Fit-Out",
  shortDescription:
    "A full interior fit-out for the Essence lounge in London — a long panelled back-bar servery with stone worktops, green ribbed gloss tiling, patterned encaustic-look floors, brick-slip feature walls, a preserved foliage wall with a neon sign and layered colour lighting.",
  category: "Commercial",
  client: "Essence",
  location: "London",
  status: "draft",
  featured: true,
  displayOrder: 3,
  completedAt: new Date("2026-04-15"),
  duration: "5 weeks",

  thumbnail: { ...emptyImg },
  heroImage: { ...emptyImg },
  gallery: [],

  overview: {
    title: "Overview",
    content:
      "A commercial unit was fitted out end to end as a hospitality lounge with a strong visual identity. We built a long back-bar servery run in dark shaker panelling with dark stone worktops, tiled the back-bar and prep walls in green ribbed gloss tile, and laid patterned black-and-white encaustic-look porcelain through the main floor. Brick-slip cladding wraps the structural columns and dividing walls, walls and ceilings were finished in a warm terracotta tone, and the scheme is lit with brass globe pendants, recessed spots and concealed colour-changing LED coves. A preserved foliage feature wall carries a custom 'Essence' neon sign. Building, joinery, tiling, decoration and electrical work were all delivered by one team.",
  },

  challenges: {
    title: "Challenges",
    items: [
      "Delivering a bold, brand-led scheme — foliage wall, neon, brick slips, patterned floors and colour lighting — to a tight programme.",
      "Setting out a long back-bar run so panelling, tiling courses and worktop joints all align across its full length.",
      "Coordinating bar services, pendant circuits, RGB LED coves and the neon transformer with no visible cabling or trunking.",
      "Laying a patterned floor tile true across a large, irregular footprint with consistent pattern match through doorways.",
    ],
  },

  solutions: {
    title: "Solutions",
    items: [
      "Built the servery carcasses and dark shaker panelling off a single datum line, then templated and fitted the dark stone tops.",
      "Tiled the back-bar walls in green ribbed gloss from set-out centre lines so courses meet the counter cleanly.",
      "Clad columns and dividing walls in brick slips on a battened substrate for a robust, textured feature.",
      "First-fixed all bar, lighting, RGB cove and neon circuits before finishes, with the installation tested and certified.",
      "Laid the encaustic-look floor from a central grid so the pattern runs continuously through the space and openings.",
    ],
  },

  results: {
    title: "Results",
    items: [
      "A fully trading-ready lounge with a distinctive, photogenic interior.",
      "A hard-wearing, easy-to-clean back-bar and servery built for daily volume.",
      "Layered lighting — colour cove wash, brass pendants and task spots — zoned for day and evening.",
      "A cohesive terracotta, green and brick palette carried across joinery, tiling, cladding and decoration.",
    ],
  },

  technologies: [
    "Commercial strip-out & prep",
    "Panelled back-bar servery joinery",
    "Dark stone worktops",
    "Green ribbed gloss wall tiling",
    "Patterned encaustic-look porcelain flooring",
    "Brick-slip column & wall cladding",
    "Preserved foliage feature wall",
    "Bespoke neon sign installation",
    "Concealed RGB LED cove lighting",
    "Brass pendant & recessed spot lighting",
    "Full first-fix electrics & testing",
    "Specialist decoration",
  ],

  projectDetails: [
    { label: "Project Type", value: "Hospitality interior fit-out" },
    { label: "Location", value: "London" },
    { label: "Scope", value: "Joinery, tiling, flooring, cladding, electrics & decoration" },
    { label: "Timeline", value: "5 weeks" },
  ],

  cta: {
    title: "Fitting out a commercial space?",
    content:
      "Tell us about the unit and the look you're after — we'll come back with next steps, free of charge.",
    buttonLabel: "Get a free quote",
    buttonHref: "/contact#quote",
  },

  seo: {
    metaTitle: "Essence Commercial Interior Fit-Out in London | BSL Construction",
    metaDescription:
      "A brand-led hospitality fit-out in London — a panelled back-bar servery with stone worktops, green ribbed tiling, patterned encaustic floors, brick-slip feature walls, a foliage neon wall and layered colour lighting.",
    keywords: [
      "commercial fit-out london",
      "hospitality fit-out london",
      "bar fit-out london",
      "restaurant fit-out london",
      "back bar joinery",
      "brick slip cladding london",
      "patterned floor tiling london",
      "neon sign installation london",
      "commercial lighting installation",
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
