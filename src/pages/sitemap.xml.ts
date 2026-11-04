import type { APIRoute } from "astro";
import { absoluteUrl, sitemapEntries } from "../lib/seo";

export const prerender = true;

const escapeXml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export const GET: APIRoute = () => {
  const urls = sitemapEntries.map(({ path, alternates, lastmod }) => {
    const alternateLinks = alternates
      ? [
          `<xhtml:link rel="alternate" hreflang="es-MX" href="${escapeXml(absoluteUrl(alternates.es))}" />`,
          `<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(absoluteUrl(alternates.en))}" />`,
          `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(alternates.es))}" />`
        ].join("")
      : "";
    const lastModified = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : "";
    return `<url><loc>${escapeXml(absoluteUrl(path))}</loc>${lastModified}${alternateLinks}</url>`;
  }).join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
};
