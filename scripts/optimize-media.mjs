// Optimize the raw Siegfried photos for the web.
// Reads the large source JPGs, emits responsive WebP + JPG variants into
// public/media/, and writes a manifest (with blur-up LQIP placeholders) to
// src/data/media-manifest.json.
//
// Usage:  npm run optimize-media
// Source dir can be overridden:  SOURCE_DIR="C:/path" npm run optimize-media

import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE_DIR = process.env.SOURCE_DIR || "C:/Users/mpera/Downloads/Auto";
const OUT_DIR = path.join(ROOT, "public", "media");
const MANIFEST = path.join(ROOT, "src", "data", "media-manifest.json");

// Output widths per role.
const SIZES = {
  full: 2400, // hero / showcase backgrounds
  card: 1200, // gallery + feature cards
  thumb: 600, // small previews
};

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source dir not found: ${SOURCE_DIR}`);
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR))
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  if (!files.length) {
    console.error("No source images found.");
    process.exit(1);
  }

  const manifest = [];
  let i = 0;

  for (const file of files) {
    i += 1;
    const id = String(i).padStart(2, "0");
    const base = `photo-${id}`;
    const src = path.join(SOURCE_DIR, file);
    const input = sharp(src).rotate(); // honour EXIF orientation
    const meta = await input.metadata();
    const aspect = meta.width && meta.height ? meta.height / meta.width : 0.66;

    for (const [role, width] of Object.entries(SIZES)) {
      const w = Math.min(width, meta.width || width);
      await sharp(src)
        .rotate()
        .resize({ width: w })
        .webp({ quality: 80 })
        .toFile(path.join(OUT_DIR, `${base}-${role}.webp`));
      await sharp(src)
        .rotate()
        .resize({ width: w })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(OUT_DIR, `${base}-${role}.jpg`));
    }

    // LQIP: tiny blurred base64 inline placeholder.
    const lqipBuf = await sharp(src)
      .rotate()
      .resize({ width: 24 })
      .blur(1)
      .webp({ quality: 40 })
      .toBuffer();
    const lqip = `data:image/webp;base64,${lqipBuf.toString("base64")}`;

    manifest.push({
      id: base,
      aspect: Number(aspect.toFixed(4)),
      lqip,
      full: `/media/${base}-full.webp`,
      fullJpg: `/media/${base}-full.jpg`,
      card: `/media/${base}-card.webp`,
      cardJpg: `/media/${base}-card.jpg`,
      thumb: `/media/${base}-thumb.webp`,
    });

    console.log(`✓ ${file} → ${base} (${meta.width}×${meta.height})`);
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. ${manifest.length} photos → ${OUT_DIR}`);
  console.log(`Manifest → ${MANIFEST}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
