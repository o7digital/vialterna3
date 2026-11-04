import { findSpanishCopy } from "./language.mjs";

export type Insight = {
  title: string;
  slug?: string;
  excerpt: string;
  body?: string;
  publishedAt?: string;
};

export type BlogPostContent = {
  id: number | string;
  slug: string;
  title: string;
  date: string;
  author: string;
  categories: string[];
  excerpt: string;
  content: string;
  image: string;
  sourceUrl?: string;
  imageAlt?: string;
};

type DatoBlogPost = {
  id?: string;
  slug?: string;
  title?: string;
  date?: string;
  author?: string;
  categories?: unknown;
  excerpt?: string;
  content?: string;
  image?: {
    url?: string;
    alt?: string;
  } | null;
  sourceUrl?: string;
};

export type SitePageContent = {
  seoTitle?: string;
  seoDescription?: string;
  eyebrow: string;
  heading: string;
  intro: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  sections: EditableSection[];
};

export type EditableCard = {
  key?: string;
  title?: string;
  text?: string;
  eyebrow?: string;
  href?: string;
  label?: string;
  type?: string;
};

type DatoDetailPage = {
  slug?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  problemTitle?: string;
  problem?: string;
  sectionTitle?: string;
  items?: unknown;
  benefits?: unknown;
};

export type EditableSection = {
  key?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  text?: string;
  items?: EditableCard[];
};

export type HomeContent = {
  seoTitle: string;
  seoDescription: string;
  hero: SitePageContent;
  risk: EditableSection;
  pillars: EditableSection;
  phases: EditableSection;
  solutions: EditableSection;
  architecture: EditableSection;
  industries: EditableSection;
  contact: SitePageContent;
};

type DatoSitePage = {
  seoTitle?: string;
  seoDescription?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  sections?: unknown;
};

const endpoint = "https://graphql.datocms.com/";
const token = import.meta.env.DATOCMS_API_TOKEN;
const environment = import.meta.env.DATOCMS_ENVIRONMENT;

const englishHrefMap: Record<string, string> = {
  "/soluciones/edge/": "/en/solutions/edge/",
  "/soluciones/core/": "/en/solutions/core/",
  "/soluciones/telco-as-a-service/": "/en/solutions/telco-as-a-service/",
  "/soluciones/iot-sim/": "/en/solutions/iot-sim/",
  "/industrias/servicios-financieros/": "/en/industries/financial-services/",
  "/industrias/retail-franquicias/": "/en/industries/retail-franchise/",
  "/industrias/energia-industria/": "/en/industries/energy-industrial/",
  "/industrias/infraestructura-pagos/": "/en/industries/payments-infrastructure/",
  "/industrias/logistica-cadena-frio/": "/en/industries/logistics-cold-chain/"
};

const datoIndustrySlugMap: Record<string, string> = {
  "retail-franchise": "retail-franchises",
  "energy-industrial": "energy-industry",
  "payments-infrastructure": "infraestructura-pagos"
};

function normalizeHrefForLocale(href: string | undefined, locale: "es" | "en"): string | undefined {
  if (!href) return href;
  const cleanHref = href.replace(/^href:\s*/i, "").trim();
  if (locale === "en") return englishHrefMap[cleanHref] ?? cleanHref;
  return cleanHref;
}

const localizedFieldsByModel = new Map<string, Promise<Set<string>>>();
const reportedSharedModels = new Set<string>();
const editorialFields = new Set(["title", "heading", "eyebrow", "label", "text", "intro", "problemTitle", "problem", "sectionTitle", "sections", "items", "benefits", "excerpt", "content", "categories", "seoTitle", "seoDescription", "ctaLabel", "secondaryCtaLabel", "alt"]);

function containsSpanishCopy(value: unknown): boolean {
  if (typeof value === "string") return findSpanishCopy(value.replace(/<[^>]*>/g, " ")).length > 0;
  if (Array.isArray(value)) return value.some(containsSpanishCopy);
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) => editorialFields.has(key) && containsSpanishCopy(item));
  }
  return false;
}

function removeUntranslatedProse(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(removeUntranslatedProse);
    return;
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (editorialFields.has(key) && containsSpanishCopy(record[key])) {
      delete record[key];
    } else {
      removeUntranslatedProse(record[key]);
    }
  }
}

async function getLocalizedFields(model: string): Promise<Set<string>> {
  if (!localizedFieldsByModel.has(model)) {
    localizedFieldsByModel.set(model, (async () => {
      const schema = await datoRequest<{
        __type: { fields: { name: string; args: { name: string }[] }[] } | null;
      }>(`query LocalizedFields($model: String!) {
        __type(name: $model) { fields { name args { name } } }
      }`, { model });

      return new Set(schema?.__type?.fields
        .filter((field) => ["locale", "fallbackLocales"].every((name) => field.args.some((arg) => arg.name === name)))
        .map((field) => field.name) ?? []);
    })());
  }
  return localizedFieldsByModel.get(model)!;
}

async function datoRequest<T>(query: string, variables: Record<string, unknown> = {}, localizedModel?: string): Promise<T | null> {
  if (!token) return null;

  try {
    if (localizedModel) {
      const localizedFields = await getLocalizedFields(localizedModel);
      const requestedFields = [...query.matchAll(/(\w+)\(locale: \$locale, fallbackLocales: \[\]\)/g)]
        .map((match) => match[1]);
      const sharedFields = requestedFields.filter((field) => !localizedFields.has(field));
      if (sharedFields.length) {
        if (!reportedSharedModels.has(localizedModel)) {
          console.warn(`[DatoCMS] ${localizedModel}: shared fields (${sharedFields.join(", ")}) use translated site content.`);
          reportedSharedModels.add(localizedModel);
        }
        if (sharedFields.length === requestedFields.length) return null;
        // Keep the fields the editor can translate and leave shared fields to
        // the fallback for this language, instead of dropping the whole record.
        query = query.replace(/^\s*(?:\w+:\s*)?(\w+)\(locale: \$locale, fallbackLocales: \[\]\)\s*$/gm,
          (selection, field) => sharedFields.includes(field) ? "" : selection);
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(environment ? { "X-Environment": environment } : {})
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) return null;

    const payload = await response.json();
    if (payload.errors?.length) return null;
    // Localization settings cannot guarantee that an editor has actually
    // translated the value. Use the English fallback for known Spanish copy.
    if (localizedModel && variables.locale === "en") removeUntranslatedProse(payload.data);

    return payload.data as T;
  } catch {
    return null;
  }
}

export async function getInsights(locale: "es" | "en", fallback: string[][]): Promise<string[][]> {
  const data = await datoRequest<{ allInsights: Insight[] }>(
    `query Insights($locale: SiteLocale) {
      allInsights(locale: $locale) {
        title
        excerpt
      }
    }`,
    { locale }
  );

  return data?.allInsights?.length
    ? data.allInsights.map((insight) => [insight.title, insight.excerpt])
    : fallback;
}

function getText(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function normalizeCards(value: unknown, fallback: EditableCard[] = []): EditableCard[] {
  if (!Array.isArray(value)) return fallback;

  const cards: EditableCard[] = [];

  for (const item of value) {
    const card = Array.isArray(item)
      ? {
          title: String(item[0] ?? ""),
          text: String(item[1] ?? ""),
          href: typeof item[2] === "string" ? item[2] : undefined
        }
      : (() => {
          const record = asRecord(item);
          if (!record) return null;

          return {
            key: getText(record, ["key", "id", "slug", "sectionId"]),
            eyebrow: getText(record, ["eyebrow", "kicker"]),
            title: getText(record, ["title", "heading", "question"]) ?? "",
            text: getText(record, ["text", "intro", "answer", "description", "body"]),
            href: getText(record, ["href", "url", "link"]),
            label: getText(record, ["label", "visualLabel"]),
            type: getText(record, ["type", "visualType"])
          };
        })();

    if (card?.title || card?.text) cards.push(card);
  }

  return cards.length ? cards : fallback;
}

function normalizeStringList(value: unknown, fallback: string[] = []): string[] {
  if (typeof value === "string") {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    return items.length ? items : fallback;
  }

  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => {
      if (typeof item === "string") return item;
      const record = asRecord(item);
      return record ? getText(record, ["title", "text", "label"]) : undefined;
    })
    .filter((item): item is string => Boolean(item?.trim()));

  return items.length ? items : fallback;
}

function normalizeBlogPost(post: DatoBlogPost, fallback?: BlogPostContent): BlogPostContent | null {
  const title = post.title?.trim();
  const slug = post.slug?.trim();
  const excerpt = post.excerpt?.trim();
  const content = post.content?.trim();

  if (!title || !slug || !excerpt || !content) return null;

  return {
    id: post.id ?? fallback?.id ?? slug,
    slug,
    title,
    date: post.date || fallback?.date || new Date().toISOString(),
    author: post.author || fallback?.author || "Vialterna",
    categories: normalizeStringList(post.categories, fallback?.categories ?? ["Insights"]),
    excerpt,
    content,
    image: post.image?.url || fallback?.image || "",
    imageAlt: post.image?.alt || fallback?.imageAlt || title,
    sourceUrl: post.sourceUrl || fallback?.sourceUrl
  };
}

export async function getBlogPosts(
  locale: "es" | "en",
  fallback: BlogPostContent[]
): Promise<BlogPostContent[]> {
  const fallbackBySlug = new Map(fallback.map((post) => [post.slug, post]));
  const data = await datoRequest<{ allBlogs: DatoBlogPost[] }>(
    `query BlogPosts($locale: SiteLocale) {
      allBlogs(locale: $locale, orderBy: date_DESC) {
        id
        slug
        title(locale: $locale, fallbackLocales: [])
        date
        author
        categories(locale: $locale, fallbackLocales: [])
        excerpt(locale: $locale, fallbackLocales: [])
        content(locale: $locale, fallbackLocales: [])
        image {
          url
          alt
        }
        sourceUrl
      }
    }`,
    { locale },
    "BlogRecord"
  );

  const posts = data?.allBlogs
    ?.map((post) => normalizeBlogPost(post, post.slug ? fallbackBySlug.get(post.slug) : undefined))
    .filter((post): post is BlogPostContent => Boolean(post));

  if (!posts?.length) return fallback;

  // Keep the existing imported archive in the site and layer DatoCMS content
  // on top of it. Editors can therefore publish only new posts in DatoCMS;
  // using an existing slug intentionally replaces that archived post.
  const mergedBySlug = new Map(fallbackBySlug);
  for (const post of posts) mergedBySlug.set(post.slug, post);

  return [...mergedBySlug.values()]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

function normalizeSections(sections: DatoSitePage["sections"], fallback: EditableSection[]): EditableSection[] {
  if (!Array.isArray(sections) || !sections.length) return fallback;

  const normalized: EditableSection[] = [];

  for (const section of sections) {
    const normalizedSection: EditableSection | null = Array.isArray(section)
      ? {
          title: String(section[0] ?? ""),
          text: String(section[1] ?? "")
        }
      : (() => {
          const record = asRecord(section);
          if (!record) return null;

          return {
            key: getText(record, ["key", "id", "slug", "sectionId"]),
            eyebrow: getText(record, ["eyebrow", "kicker"]),
            title: getText(record, ["title", "heading", "question"]) ?? "",
            intro: getText(record, ["intro", "description"]),
            text: getText(record, ["text", "body", "answer"]),
            items: normalizeCards(record.items ?? record.cards ?? record.links, [])
          };
        })();

    if (normalizedSection?.title || normalizedSection?.text || normalizedSection?.items?.length) {
      normalized.push(normalizedSection);
    }
  }

  return normalized.length ? normalized : fallback;
}

export async function getSitePage(
  pageId: string,
  locale: "es" | "en",
  fallback: SitePageContent
): Promise<SitePageContent> {
  const data = await datoRequest<{ allSitePages: DatoSitePage[] }>(
    `query SitePage($pageId: String, $locale: SiteLocale) {
      allSitePages(filter: { pageId: { eq: $pageId } }, locale: $locale, first: 1) {
        id
        seoTitle(locale: $locale, fallbackLocales: [])
        seoDescription(locale: $locale, fallbackLocales: [])
        eyebrow(locale: $locale, fallbackLocales: [])
        heading(locale: $locale, fallbackLocales: [])
        intro(locale: $locale, fallbackLocales: [])
        ctaLabel(locale: $locale, fallbackLocales: [])
        ctaHref(locale: $locale, fallbackLocales: [])
        secondaryCtaLabel(locale: $locale, fallbackLocales: [])
        secondaryCtaHref(locale: $locale, fallbackLocales: [])
        sections(locale: $locale, fallbackLocales: [])
      }
    }`,
    { pageId, locale },
    "SitePageRecord"
  );

  const page = data?.allSitePages?.[0];
  if (!page) return fallback;

  return {
    seoTitle: page.seoTitle || fallback.seoTitle,
    seoDescription: page.seoDescription || fallback.seoDescription,
    eyebrow: page.eyebrow || fallback.eyebrow,
    heading: page.heading || fallback.heading,
    intro: page.intro || fallback.intro,
    ctaLabel: page.ctaLabel || fallback.ctaLabel,
    ctaHref: page.ctaHref || fallback.ctaHref,
    secondaryCtaLabel: page.secondaryCtaLabel || fallback.secondaryCtaLabel,
    secondaryCtaHref: page.secondaryCtaHref || fallback.secondaryCtaHref,
    sections: normalizeSections(page.sections, fallback.sections)
  };
}

function mergeHomeCards(value: unknown, locale: "es" | "en", fallback: EditableCard[]): EditableCard[] {
  const cards = Array.isArray(value) && value.length
    ? value.map((item) => normalizeCards([item], [])[0] ?? { href: getText(asRecord(item) ?? {}, ["href"]) })
    : fallback;
  const merged = cards.map((card) => {
    const href = normalizeHrefForLocale(card.href, locale);
    const translated = fallback.find((item) => normalizeHrefForLocale(item.href, locale) === href);
    const populated = Object.fromEntries(Object.entries(card).filter(([, value]) => value !== undefined && value !== ""));
    return { ...translated, ...populated, href };
  }).filter((card) => card.title || card.text);
  return merged.length ? merged : fallback;
}

export async function getHomeSolutions(locale: "es" | "en", fallback: EditableCard[]): Promise<EditableCard[]> {
  // A collection-level locale does not translate shared CMS fields. Require
  // localized copy; models without it use the site's translated fallback.
  const data = await datoRequest<{ allHomeSolutions: EditableCard[] }>(
    `query HomeSolutions($locale: SiteLocale) {
      allHomeSolutions(locale: $locale, orderBy: _createdAt_ASC) {
        eyebrow(locale: $locale, fallbackLocales: [])
        title(locale: $locale, fallbackLocales: [])
        text(locale: $locale, fallbackLocales: [])
        href
        label(locale: $locale, fallbackLocales: [])
      }
    }`,
    { locale },
    "HomeSolutionRecord"
  );

  const cards = mergeHomeCards(data?.allHomeSolutions, locale, fallback).map((card) => ({
    ...card,
    href: normalizeHrefForLocale(card.href, locale),
    type: card.type ?? (
      card.href?.includes("core") ? "signal" :
      card.href?.includes("telco-as-a-service") ? "backup" :
      card.href?.includes("iot-sim") ? "cells" :
      "rings"
    )
  }));

  return cards.length ? cards : fallback;
}

export async function getHomeIndustries(locale: "es" | "en", fallback: EditableCard[]): Promise<EditableCard[]> {
  const data = await datoRequest<{ allHomeIndustries: EditableCard[] }>(
    `query HomeIndustries($locale: SiteLocale) {
      allHomeIndustries(locale: $locale, orderBy: _createdAt_ASC) {
        title(locale: $locale, fallbackLocales: [])
        text(locale: $locale, fallbackLocales: [])
        href
      }
    }`,
    { locale },
    "HomeIndustryRecord"
  );

  return mergeHomeCards(data?.allHomeIndustries, locale, fallback);
}

export async function getDatoDetailPage(
  type: "solution" | "industry",
  locale: "es" | "en",
  slug: string,
  fallback: {
    eyebrow: string;
    title: string;
    description: string;
    problemTitle?: string;
    problem?: string;
    sectionTitle: string;
    items: EditableCard[];
    benefits: string[];
  }
) {
  const model = type === "solution" ? "allSolutionPages" : "allSolutionPageCopy1s";
  const datoSlug = type === "industry" && locale === "en" ? (datoIndustrySlugMap[slug] ?? slug) : slug;
  const data = await datoRequest<{ records: DatoDetailPage[] }>(
    `query DetailPage($slug: String, $locale: SiteLocale) {
      records: ${model}(locale: $locale, filter: { slug: { eq: $slug } }, first: 1) {
        slug
        eyebrow(locale: $locale, fallbackLocales: [])
        title(locale: $locale, fallbackLocales: [])
        text(locale: $locale, fallbackLocales: [])
        problemTitle: problemtitle(locale: $locale, fallbackLocales: [])
        problem(locale: $locale, fallbackLocales: [])
        sectionTitle: sectiontitle(locale: $locale, fallbackLocales: [])
        items(locale: $locale, fallbackLocales: [])
        benefits(locale: $locale, fallbackLocales: [])
      }
    }`,
    { slug: datoSlug, locale },
    type === "solution" ? "SolutionPageRecord" : "SolutionPageCopy1Record"
  );

  const page = data?.records?.[0];
  if (!page) return fallback;

  return {
    eyebrow: page.eyebrow || fallback.eyebrow,
    title: page.title || fallback.title,
    description: page.text || fallback.description,
    problemTitle: page.problemTitle || fallback.problemTitle,
    problem: page.problem || fallback.problem,
    sectionTitle: page.sectionTitle || fallback.sectionTitle,
    items: normalizeCards(page.items, fallback.items),
    benefits: normalizeStringList(page.benefits, fallback.benefits)
  };
}

export async function getHomePage(locale: "es" | "en", fallback: HomeContent): Promise<HomeContent> {
  const page = await getSitePage("home", locale, fallback.hero);
  const normalizeLookup = (value?: string) => value?.toLowerCase().trim();
  const sectionByKey = new Map(
    page.sections
      .map((section) => [normalizeLookup(section.key), section] as const)
      .filter((entry): entry is [string, EditableSection] => Boolean(entry[0]))
  );
  const sectionByTitle = new Map(page.sections.map((section) => [section.title.toLowerCase().trim(), section]));
  const findSection = (...keys: string[]) => {
    for (const key of keys) {
      const section = sectionByKey.get(key) ?? sectionByTitle.get(key);
      if (section) return section;
    }
  };
  const contactSection = findSection("contact", "contacto");

  return {
    ...fallback,
    seoTitle: page.seoTitle || fallback.seoTitle,
    seoDescription: page.seoDescription || fallback.seoDescription,
    hero: page,
    risk: findSection("risk", "riesgo", "riesgo operativo") ?? fallback.risk,
    pillars: findSection("pillars", "modelo", "modelo vialterna") ?? fallback.pillars,
    phases: findSection("phases", "implementacion", "implementación") ?? fallback.phases,
    solutions: {
      ...(findSection("solutions", "soluciones") ?? fallback.solutions),
      items: await getHomeSolutions(locale, fallback.solutions.items ?? [])
    },
    architecture: findSection("architecture", "arquitectura") ?? fallback.architecture,
    industries: {
      ...(findSection("industries", "industrias") ?? fallback.industries),
      items: await getHomeIndustries(locale, fallback.industries.items ?? [])
    },
    contact: contactSection
      ? {
          ...fallback.contact,
          eyebrow: contactSection.eyebrow || fallback.contact.eyebrow,
          heading: contactSection.title || fallback.contact.heading,
          intro: contactSection.intro || contactSection.text || fallback.contact.intro
        }
      : fallback.contact
  };
}
