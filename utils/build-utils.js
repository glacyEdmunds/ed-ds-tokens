// utils/build-utils.js  v4 ESM
import fs from "node:fs/promises";
import path from "node:path";

async function listScssFiles(rootDir) {
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile() && full.endsWith(".scss")) {
        out.push(path.relative(rootDir, full));
      }
    }
  }
  await walk(rootDir);
  return out;
}

export async function buildIndexScssFiles() {
  const buildRoot = "build";
  const platforms = await fs.readdir(buildRoot, { withFileTypes: true });
  for (const plat of platforms) {
    if (!plat.isDirectory()) continue;
    const platDir = path.join(buildRoot, plat.name);
    const files = await listScssFiles(platDir);
    const lines = files
      .map((f) => `@forward './${f.replace(/\\/g, "/")}';`)
      .join("\n");
    await fs.writeFile(path.join(platDir, "_index.scss"), lines);
  }
}
