/**
 * scripts/add-quote.mjs
 * -------------------------------------------------------------------------
 * Seed a Quote document straight into MongoDB (Avisford Project — Crest
 * Hotels LTD). Idempotent: keyed on client name + project, so re-running
 * updates the same quote rather than creating duplicates.
 *
 * Run:  node scripts/add-quote.mjs
 * -------------------------------------------------------------------------
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const raw = readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!(t.slice(0, i).trim() in process.env))
      process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}
loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const QUOTE = {
  status: "sent",
  date: new Date("2026-08-26"),
  project: "Avisford Project",
  location:
    "Avisford Park Hotel, Avisford Park Rd, Yapton Ln, Walberton, Arundel, BN18 0LS",
  preparedBy: "Karam – OFFBRIDGE LTD",
  client: { name: "Crest Hotels LTD", addressLines: [], email: "", phone: "" },
  intro: "",
  notes: "",
  sections: [
    {
      title: "Site Preparation, Protection, Site & Project Management",
      bullets: [
        "Site preparation before starting works.",
        "Floor and area protection where required.",
        "Covering and protecting working areas during the refurbishment.",
        "Waste handling, rubbish removal and skip arrangements included.",
        "Ongoing management of the site throughout the programme.",
      ],
      note: "These works include the supply of all site prep and protection materials, such as dust sheets, coverings, waste bags, consumables, skip hire and waste disposal costs.",
      price: 13800,
    },
    {
      title: "LVT Flooring Installation",
      bullets: [
        "Supply and installation of new LVT flooring throughout the required areas (Bar area, Main area, Restaurant area 1).",
        "LVT flooring to be installed to the same specification as Tiverton.",
        "Installation over ply where required.",
        "Supply of LVT adhesive and all related flooring consumables.",
        "Floor preparation, setting out, cutting, fitting and finishing.",
      ],
      note: "These works include the supply of LVT flooring, floor prep materials, ply where required, LVT adhesive, flooring trims where specified, and associated flooring consumables.",
      price: 32000,
    },
    {
      title: "Bar Area",
      bullets: [
        "Wall tiling of front of bar area.",
        "Floor tiling in front of the bar area.",
        "Installation of shaker panels incorporating radiator cover and TV area.",
        "Building stud walls to both sides of the toilet entrance.",
        "Installation of shaker panels by the toilets, incorporating radiator cover and TV area.",
        "Installation of T&G dropped ceiling by the steps, including LED surround.",
        "Installation of T&G wall panelling to Dado height.",
        "Installation of feature partition, approximately 5 metres long, including worktop.",
        "Supply and installation of 8 new brushed chrome USB sockets.",
      ],
      note: "These works include the supply of shaker panel fixings, adhesives where required, and associated installation consumables. Client is to supply T&G boards and tiles.",
      price: 32200,
    },
    {
      title: "Main Area",
      bullets: [
        "Installation of T&G feature ceiling, including overboarding, new LED spotlights and installation of feature chandelier.",
        "Installation of feature partition, approximately 4.3 metres long, similar to the Tiverton design.",
        "Installation of shaker panels to both sides of the entrance, including radiator covers and TV positions.",
        "Installation of green wall to the entrance of the panelled restaurant.",
        "Replacement of 6 existing brushed chrome USB sockets.",
        "Supply and installation of 12 new brushed chrome USB sockets.",
      ],
      note: "",
      price: 0,
    },
  ],
};

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const col = mongoose.connection.collection("quotes");
  const now = new Date();

  const existing = await col.findOne({
    "client.name": QUOTE.client.name,
    project: QUOTE.project,
  });

  if (existing) {
    await col.updateOne(
      { _id: existing._id },
      { $set: { ...QUOTE, updatedAt: now } },
    );
    console.log(`Updated ${existing.quoteNumber} — "${QUOTE.project}"`);
  } else {
    const last = await col.find({}).sort({ seq: -1 }).limit(1).toArray();
    const seq = (last[0]?.seq ?? 0) + 1;
    const quoteNumber = `QUO-${String(seq).padStart(4, "0")}`;
    const res = await col.insertOne({
      ...QUOTE,
      seq,
      quoteNumber,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Inserted ${quoteNumber} — "${QUOTE.project}" (_id ${res.insertedId})`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
