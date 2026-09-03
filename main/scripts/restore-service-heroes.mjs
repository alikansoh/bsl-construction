/**
 * Restore hero images on the 5 dashboard-created services that already had
 * one (overwritten by the Unsplash seeder). Their own project photos still
 * exist on their content sections, so point the hero back at the first of
 * those. The Unsplash images stay on the services that never had a hero.
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

const SLUGS = [
  "new-builds",
  "extensions",
  "loft-conversions",
  "basement-conversions",
  "refurbishments",
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const col = mongoose.connection.collection("services");

  for (const slug of SLUGS) {
    const s = await col.findOne({ slug });
    if (!s) {
      console.log(`skip ${slug} (not found)`);
      continue;
    }
    const own = (s.sections || []).map((x) => x.image).find((im) => im?.url);
    if (!own) {
      console.log(`!!  ${slug}: no original photo to restore — left as is, re-upload the hero in the dashboard`);
      continue;
    }
    await col.updateOne(
      { _id: s._id },
      {
        $set: {
          "hero.image": {
            url: own.url,
            publicId: own.publicId || "",
            alt: own.alt || s.hero?.title || s.title,
          },
          updatedAt: new Date(),
        },
      },
    );
    console.log(`restored ${slug}  ->  ${own.url}`);
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
