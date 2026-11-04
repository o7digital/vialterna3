import fs from "node:fs";
import { join } from "node:path";
import { getBuildOutputDirectory } from "./build-output.mjs";

const outputDirectory = getBuildOutputDirectory();

function loadPosts(file, exportName) {
  const source = fs.readFileSync(file, "utf8");
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${marker} in ${file}`);

  const afterMarker = source.slice(start + marker.length);
  const end = afterMarker.lastIndexOf("] satisfies");
  if (end < 0) throw new Error(`Missing satisfies clause in ${file}`);

  return Function(`return ${afterMarker.slice(0, end + 1)}`)();
}

const spanishPosts = loadPosts("src/data/insights.ts", "insightPosts");
const englishPosts = loadPosts("src/data/insightsEn.ts", "insightPostsEn");
const englishByOriginalSlug = new Map(englishPosts.map((post) => [post.originalSlug, post]));
const problems = [];

function clickCtaLinks(content) {
  const links = [];
  const anchorPattern = /<a\b([^>]*)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of content.matchAll(anchorPattern)) {
    const label = match[4].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().toLowerCase();
    const normalized = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isClickCta = /^(da\s+)?clic\s+aqui\.?$/.test(normalized)
      || /^click\s+here\.?$/.test(normalized)
      || /^(aqui|here)\.?$/.test(normalized);
    if (isClickCta) links.push({ href: match[2], label });
  }
  return links;
}

if (spanishPosts.length !== englishPosts.length) {
  problems.push(`Post count mismatch: ES=${spanishPosts.length}, EN=${englishPosts.length}`);
}

for (const spanishPost of spanishPosts) {
  const englishPost = englishByOriginalSlug.get(spanishPost.slug);
  if (!englishPost) {
    problems.push(`Missing English post for ${spanishPost.slug}`);
    continue;
  }

  if (englishPost.slug === spanishPost.slug) {
    problems.push(`English slug is not translated for ${spanishPost.slug}`);
  }

  for (const field of ["title", "excerpt", "content"]) {
    if (englishPost[field] === spanishPost[field]) {
      problems.push(`English ${field} is unchanged for ${spanishPost.slug}`);
    }
  }

  const expectedPages = [
    join(outputDirectory, `insights/${spanishPost.slug}/index.html`),
    join(outputDirectory, `en/insights/${spanishPost.slug}/index.html`),
    join(outputDirectory, `en/insights/${englishPost.slug}/index.html`)
  ];

  for (const page of expectedPages) {
    if (!fs.existsSync(page)) problems.push(`Missing generated page ${page}`);
  }

  for (const link of clickCtaLinks(spanishPost.content)) {
    const expectedHref = "/contacto/";
    if (link.href !== expectedHref) {
      problems.push(`Spanish click CTA for ${spanishPost.slug} points to ${link.href}, expected ${expectedHref}`);
    }
  }

  for (const link of clickCtaLinks(englishPost.content)) {
    const expectedHref = "/en/contact/";
    if (link.href !== expectedHref) {
      problems.push(`English click CTA for ${englishPost.slug} points to ${link.href}, expected ${expectedHref}`);
    }
  }
}

const englishIndex = fs.readFileSync(join(outputDirectory, "en/insights/index.html"), "utf8");
const spanishTitlesOnEnglishIndex = spanishPosts
  .filter((post) => englishIndex.includes(post.title))
  .map((post) => post.slug);

if (spanishTitlesOnEnglishIndex.length) {
  problems.push(`Spanish titles found on English index: ${spanishTitlesOnEnglishIndex.join(", ")}`);
}

const missingEnglishTitles = englishPosts
  .filter((post) => !englishIndex.includes(post.title))
  .map((post) => post.slug);

if (missingEnglishTitles.length) {
  problems.push(`English titles missing from English index: ${missingEnglishTitles.join(", ")}`);
}

if (problems.length) {
  console.error("Insight i18n check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Insight i18n check passed: ${spanishPosts.length} ES posts, ${englishPosts.length} EN posts.`);
