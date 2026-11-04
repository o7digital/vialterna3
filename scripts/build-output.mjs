import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export function getBuildOutputDirectory() {
  for (const directory of [".vercel/output/static/", "dist/client/", "dist/"]) {
    const path = fileURLToPath(new URL(`../${directory}`, import.meta.url));
    if (existsSync(join(path, "index.html"))) return path;
  }
  throw new Error("No built site found. Run npm run build first.");
}
