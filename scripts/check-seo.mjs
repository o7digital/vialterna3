import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { getBuildOutputDirectory } from "./build-output.mjs";

const dist = getBuildOutputDirectory();
const errors = [];

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});

const routeForFile = (file) => {
  const path = relative(dist, file).split(sep).join("/");
  return path === "index.html" ? "/" : `/${path.replace(/index\.html$/, "")}`;
};

const tagWith = (html, tag, attribute, value) => {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) ?? [];
  return tags.find((candidate) => new RegExp(`${attribute}=["']${value}["']`, "i").test(candidate));
};

const attribute = (tag, name) => tag?.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1];
const pageFiles = walk(dist).filter((file) => file.endsWith("index.html"));
const indexableRoutes = new Map();
const geoTargetedRoutes = new Set([
  "/", "/empresa/", "/contacto/", "/faq/", "/auditoria-telco/", "/insights/",
  "/soluciones/edge/", "/soluciones/core/", "/soluciones/telco-as-a-service/", "/soluciones/iot-sim/",
  "/industrias/servicios-financieros/", "/industrias/retail-franquicias/", "/industrias/energia-industria/",
  "/industrias/infraestructura-pagos/", "/industrias/logistica-cadena-frio/",
  "/en/", "/en/company/", "/en/contact/", "/en/faq/", "/en/telco-audit/", "/en/insights/",
  "/en/solutions/edge/", "/en/solutions/core/", "/en/solutions/telco-as-a-service/", "/en/solutions/iot-sim/",
  "/en/industries/financial-services/", "/en/industries/retail-franchise/", "/en/industries/energy-industrial/",
  "/en/industries/payments-infrastructure/", "/en/industries/logistics-cold-chain/", "/en/platform/air-connect/"
]);
let redirects = 0;
let aliases = 0;
let articles = 0;

for (const file of pageFiles) {
  const route = routeForFile(file);
  const html = readFileSync(file, "utf8");
  if (/http-equiv=["']refresh["']/i.test(html)) {
    redirects += 1;
    continue;
  }

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = attribute(tagWith(html, "meta", "name", "description"), "content");
  const robots = attribute(tagWith(html, "meta", "name", "robots"), "content") ?? "";
  const canonical = attribute(tagWith(html, "link", "rel", "canonical"), "href");
  const noindex = robots.includes("noindex");

  if (!title) errors.push(`${route}: missing title`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (!canonical?.startsWith("https://www.vialterna.com/")) errors.push(`${route}: invalid canonical ${canonical ?? "missing"}`);
  if (!tagWith(html, "meta", "property", "og:image")) errors.push(`${route}: missing og:image`);
  if (!tagWith(html, "meta", "name", "twitter:card")) errors.push(`${route}: missing Twitter card`);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) errors.push(`${route}: expected exactly one h1`);
  if (geoTargetedRoutes.has(route)) {
    const geoPattern = route.startsWith("/en/") ? /Mexico(?: City)?/ : /México|CDMX/;
    if (!geoPattern.test(`${title} ${description}`)) errors.push(`${route}: missing localized SEO metadata`);
  }
  if (["/", "/en/"].includes(route) && (!html.includes('"areaServed"') || !html.includes('"alternateName":"CDMX"'))) {
    errors.push(`${route}: missing Mexico/CDMX service area structured data`);
  }

  const expectedContact = route.startsWith("/en/") ? "/en/contact/" : "/contacto/";
  const expectedAudit = route.startsWith("/en/") ? "/en/telco-audit/" : "/auditoria-telco/";
  const primaryLinks = (html.match(/<a\b[^>]*>/gi) ?? [])
    .filter((tag) => (attribute(tag, "class") ?? "").split(/\s+/).includes("primary"));
  for (const tag of primaryLinks) {
    const href = attribute(tag, "href");
    if (![expectedContact, expectedAudit, "#audit-form"].includes(href)) {
      errors.push(`${route}: orange CTA points to ${href ?? "missing"}, expected ${expectedAudit}, ${expectedContact}, or #audit-form`);
    }
  }

  if (noindex && canonical !== `https://www.vialterna.com${route}`) {
    aliases += 1;
    if (canonical === `https://www.vialterna.com${route}`) errors.push(`${route}: noindex alias has a self canonical`);
    continue;
  }

  if (canonical !== `https://www.vialterna.com${route}`) errors.push(`${route}: canonical does not match its public route`);
  if (indexableRoutes.has(canonical)) errors.push(`${route}: duplicate canonical also used by ${indexableRoutes.get(canonical)}`);
  indexableRoutes.set(canonical, route);

  if (/^\/(en\/)?insights\/[^/]+\/$/.test(route)) {
    articles += 1;
    if (!html.includes('"@type":"BlogPosting"')) errors.push(`${route}: missing BlogPosting structured data`);
  }

  for (const href of html.matchAll(/href=["'](\/[^"'#?]*)(?:[?#][^"']*)?["']/gi)) {
    const target = href[1];
    if (target === "/") continue;
    const targetFile = target.endsWith("/")
      ? join(dist, target, "index.html")
      : join(dist, target);
    if (!existsSync(targetFile)) errors.push(`${route}: broken internal link ${target}`);
  }
}

const sitemapFile = join(dist, "sitemap.xml");
const robotsFile = join(dist, "robots.txt");
if (!existsSync(sitemapFile)) errors.push("missing sitemap.xml");
if (!existsSync(robotsFile)) errors.push("missing robots.txt");

const sitemap = existsSync(sitemapFile) ? readFileSync(sitemapFile, "utf8") : "";
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set(sitemapUrls);
if (sitemapSet.size !== sitemapUrls.length) errors.push("sitemap contains duplicate URLs");
for (const canonical of indexableRoutes.keys()) {
  if (!sitemapSet.has(canonical)) errors.push(`sitemap is missing ${canonical}`);
}
for (const url of sitemapSet) {
  if (!indexableRoutes.has(url)) errors.push(`sitemap contains a non-indexable URL: ${url}`);
}

const robots = existsSync(robotsFile) ? readFileSync(robotsFile, "utf8") : "";
if (!robots.includes("Sitemap: https://www.vialterna.com/sitemap.xml")) errors.push("robots.txt has an invalid sitemap URL");

if (errors.length) {
  console.error(`SEO check failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO check passed: ${indexableRoutes.size} canonical routes (review site remains noindex), ${articles} articles, ${aliases} aliases, ${redirects} redirects.`);
