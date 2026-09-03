/**
 * scripts/set-service-hero-images.mjs
 * -------------------------------------------------------------------------
 * Sets hero.image on each service (by slug) to an Unsplash photo, so the
 * service pages get a real hero instead of the empty dark header.
 *
 * Swap any URL later in the dashboard. Re-running is safe (idempotent).
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

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

const u = (id) =>
  `https://images.unsplash.com/${id}?w=1920&q=80&auto=format&fit=crop`;

// slug -> [unsplash photo id, alt text]
const MAP = {
  // Construction
  "new-builds": ["photo-1541888946425-d81bb19240f5", "A newly completed detached home"],
  extensions: ["photo-1523413363574-c30aa1c2a516", "A rear extension under construction"],
  "loft-conversions": ["photo-1512917774080-9991f1c4c750", "A bright, open loft conversion"],
  "basement-conversions": ["photo-1558618666-fcd25c85cd64", "A finished lower-ground living space"],
  kitchens: ["photo-1600585154340-be6161a56a0c", "A bright, newly fitted kitchen"],
  bathrooms: ["photo-1600566753190-17f0baa2a6c3", "A fully tiled modern bathroom"],
  roofing: ["photo-1632759145351-1d592919f522", "A pitched tiled roof against the sky"],

  // Mechanical & Electrical
  refurbishments: ["photo-1560448204-e02f11c3d0e2", "A refurbished open-plan living room"],
  plumbing: ["photo-1584622781564-1d987f7333c1", "A plumber fitting pipework under a sink"],
  heating: ["photo-1581092160562-40aa08e78837", "An engineer working on heating pipework"],
  boilers: ["photo-1621905252507-b35492cc74b4", "Copper pipework and heating controls"],
  "heat-pumps": ["photo-1620626011761-996317b8d101", "An air source heat pump outdoor unit"],
  gas: ["photo-1581094794329-c8112a89af12", "A Gas Safe engineer working on pipework"],
  electrical: ["photo-1621905251189-08b45d6a269e", "An electrician working on a consumer unit"],
  "air-conditioning": ["photo-1581858726788-75bc0f6a952d", "Building mechanical services"],
  "water-regulations": ["photo-1584622650111-993a426fbf0a", "Pipework, valves and controls"],
  "rpz-testing": ["photo-1584132967334-10e028bd69f7", "Testing a backflow prevention valve"],

  // Commercial
  "hotel-maintenance": ["photo-1566073771259-6a8506099945", "A hotel guest room"],
  "commercial-maintenance": ["photo-1497366811353-6870744d04b2", "A modern commercial office interior"],
  "planned-maintenance": ["photo-1517048676732-d65bc937f952", "A team reviewing a maintenance schedule"],
  "reactive-maintenance": ["photo-1521791136064-7986c2920216", "A maintenance engineer on a callout"],
  "facilities-support": ["photo-1497366216548-37526070297c", "A facilities team in an office"],
};

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const col = mongoose.connection.collection("services");

  let updated = 0;
  const all = await col.find({}).project({ slug: 1 }).toArray();

  for (const svc of all) {
    const entry = MAP[svc.slug];
    if (!entry) {
      console.log(`skip  ${svc.slug} (no mapping)`);
      continue;
    }
    const [id, alt] = entry;
    await col.updateOne(
      { _id: svc._id },
      { $set: { "hero.image": { url: u(id), publicId: "", alt }, updatedAt: new Date() } },
    );
    updated++;
    console.log(`set   ${svc.slug}  ->  ${id}`);
  }

  console.log(`\nUpdated ${updated} / ${all.length} services.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
