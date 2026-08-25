// One-off script: uploads every image in frontend/src/assets/gallery to Cloudinary
// and inserts a matching row in the gallery_images table so the public site
// (and admin Gallery manager) serve them from Cloudinary instead of local disk.
//
// Usage (from backend/):
//   npm run migrate:gallery
//
// Safe to re-run: skips any file whose name is already recorded in `migrated_from`.

const fs = require('fs');
const path = require('path');
const db = require('../src/db');
const { uploadBuffer } = require('../src/utils/cloudinary');

const GALLERY_DIR = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'gallery');
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;

async function main() {
  await db.ensureReady();

  if (!fs.existsSync(GALLERY_DIR)) {
    console.log(`No gallery folder found at ${GALLERY_DIR}, nothing to migrate.`);
    return;
  }

  const files = fs
    .readdirSync(GALLERY_DIR)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (!files.length) {
    console.log('No local gallery images found to migrate.');
    return;
  }

  const existing = await db.getGalleryImages();
  const alreadyMigrated = new Set(existing.map((img) => img.sourceFile).filter(Boolean));

  let uploaded = 0;
  for (const file of files) {
    if (alreadyMigrated.has(file)) {
      console.log(`Skipping ${file} (already migrated).`);
      continue;
    }

    const buffer = fs.readFileSync(path.join(GALLERY_DIR, file));
    const { url, publicId } = await uploadBuffer(buffer, { folder: 'rescuedFurWorld/gallery' });
    await db.createGalleryImage({ url, publicId, caption: '', sourceFile: file });
    uploaded += 1;
    console.log(`Uploaded ${file} -> ${url}`);
  }

  console.log(`Done. Uploaded ${uploaded} new image(s) to Cloudinary.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Gallery migration failed:', err);
  process.exit(1);
});
