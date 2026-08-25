/* eslint-disable */
// Scans src/assets/gallery and writes manifest.json listing every image file.
// Supports a --watch flag that regenerates the manifest whenever files change.
const fs = require('fs');
const path = require('path');

const GALLERY_DIR = path.join(__dirname, '..', 'src', 'assets', 'gallery');
const MANIFEST_PATH = path.join(GALLERY_DIR, 'manifest.json');
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;

function readImages() {
  return fs
    .readdirSync(GALLERY_DIR)
    .filter((name) => IMAGE_EXT.test(name))
    .filter((name) => name.toLowerCase() !== 'manifest.json')
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
}

function writeManifest() {
  if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
  }

  const files = readImages();
  const next = JSON.stringify({ images: files }, null, 2) + '\n';

  let current = '';
  try {
    current = fs.readFileSync(MANIFEST_PATH, 'utf8');
  } catch (_) {
    /* no existing manifest */
  }

  if (current === next) {
    return { changed: false, count: files.length };
  }

  fs.writeFileSync(MANIFEST_PATH, next);
  return { changed: true, count: files.length };
}

function log(result) {
  const rel = path.relative(process.cwd(), MANIFEST_PATH);
  if (result.changed) {
    console.log(`[gallery] updated ${rel} (${result.count} image${result.count === 1 ? '' : 's'})`);
  }
}

function main() {
  const watch = process.argv.includes('--watch');
  log(writeManifest());

  if (!watch) return;

  console.log(`[gallery] watching ${path.relative(process.cwd(), GALLERY_DIR)} for changes...`);

  let debounce = null;
  const trigger = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      try {
        log(writeManifest());
      } catch (err) {
        console.error('[gallery] failed to update manifest:', err.message);
      }
    }, 150);
  };

  try {
    fs.watch(GALLERY_DIR, { persistent: true }, (_event, filename) => {
      if (!filename) return trigger();
      if (filename.toLowerCase() === 'manifest.json') return;
      if (!IMAGE_EXT.test(filename)) return;
      trigger();
    });
  } catch (err) {
    console.error('[gallery] watcher failed to start:', err.message);
  }
}

main();
