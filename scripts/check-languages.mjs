import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { getBuildOutputDirectory } from "./build-output.mjs";
import { findSpanishCopy } from "../src/lib/language.mjs";

// Check rendered copy, including accessibility labels and the chat's initial
// HTML. Scripts and URLs may legitimately contain both languages.
const errors = [];
const origin = process.argv[2];

function checkPage(route, html) {
  if (/http-equiv=["']refresh["']/i.test(html)) return;
  if (!/<html\b[^>]*lang="en"/i.test(html)) errors.push(`${route}: missing English document language`);

  const markup = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const labels = [...markup.matchAll(/(?:aria-label|placeholder|title|alt)="([^"]*)"/gi)].map((match) => match[1]);
  const text = [markup.replace(/<[^>]+>/g, " "), ...labels].join(" ");
  const remaining = findSpanishCopy(text);
  if (remaining.length) errors.push(`${route}: Spanish copy remains: ${remaining.join(", ")}`);
}

let checked = 0;
if (origin) {
  const sitemapResponse = await fetch(new URL("/sitemap.xml", origin));
  if (!sitemapResponse.ok) throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((route) => route.startsWith("/en/"));
  if (!routes.length) throw new Error("No English routes found in sitemap");
  for (let offset = 0; offset < routes.length; offset += 8) {
    await Promise.all(routes.slice(offset, offset + 8).map(async (route) => {
      const response = await fetch(new URL(route, origin));
      if (!response.ok) errors.push(`${route}: HTTP ${response.status}`);
      else checkPage(route, await response.text());
      checked += 1;
    }));
  }
} else {
  const directory = join(getBuildOutputDirectory(), "en");
  const walk = (path) => readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const file = join(path, entry.name);
    return entry.isDirectory() ? walk(file) : file.endsWith("index.html") ? [file] : [];
  });
  for (const file of walk(directory)) {
    const route = `/en/${relative(directory, file).replace(/index\.html$/, "")}`;
    checkPage(route, readFileSync(file, "utf8"));
    checked += 1;
  }
}

if (errors.length) {
  console.error(`Language check failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}
console.log(`Language check passed: ${checked} English pages (${origin ?? "local build"}).`);
