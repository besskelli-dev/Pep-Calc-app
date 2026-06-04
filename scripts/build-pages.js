const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const ROOT_FILES = [
  "index.html",
  "style.css",
  "status-tracker-styles.css",
  "script.js",
  "calculator.js",
  "peptide-library-data.js",
  "status-tracker.js",
  "manifest.webmanifest",
  "service-worker.js",
  "_headers"
];

const DIRS_TO_COPY = [
  "icons",
  "Logo"
];

function ensureCleanDist() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
}

function copyFileRelative(relativePath) {
  const src = path.join(ROOT, relativePath);
  const dest = path.join(DIST, relativePath);

  if (!fs.existsSync(src)) {
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDirFiltered(relativeDir) {
  const srcDir = path.join(ROOT, relativeDir);
  const destDir = path.join(DIST, relativeDir);

  if (!fs.existsSync(srcDir)) {
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const rel = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      copyDirFiltered(rel);
      continue;
    }

    // Cloudflare Pages rejects files larger than 25 MiB; skip source design files.
    if (/\.psd$/i.test(entry.name)) {
      continue;
    }

    copyFileRelative(rel);
  }
}

function run() {
  ensureCleanDist();

  ROOT_FILES.forEach(copyFileRelative);
  DIRS_TO_COPY.forEach(copyDirFiltered);

  console.log("Pages build complete: dist/");
}

run();
