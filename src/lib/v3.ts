import copy from '../data/v3/copy.json';
export type Lang = 'es' | 'en';
export type Item = { title: string; text: string };
export const tables = copy as Record<string, Record<string, Record<Lang, string>>>;
export const t = (page: string, key: string, lang: Lang): string => tables[page]?.[key]?.[lang] ?? '';
export const plain = (value: string) => value.replace(/\*\*/g, '').trim();
export const split = (value: string) => value.split(' · ').map(s => s.trim()).filter(Boolean);
export const item = (value: string): Item => {
 const match = value.match(/^\*\*(.*?)\*\*\s*(.*)$/s);
 return match ? { title: match[1].replace(/[.:]$/, ''), text: match[2] } : { title: plain(value), text: '' };
};
export const items = (value: string): Item[] => split(value).map(item);
export const stripButton = (value: string) => value.replace(/\s*(Botón|Button):.*$/s, '').trim();
export const auditHref = (lang: Lang) => lang === 'en' ? '/en/telco-audit/' : '/auditoria-telco/';
export const solutionHref = (slug: string, lang: Lang) => `${lang === 'en' ? '/en/solutions' : '/soluciones'}/${slug}/`;
export const solutionLinks = (lang: Lang) => [
 { label: 'Edge to Cloud', href: solutionHref('edge-to-cloud', lang) },
 { label: 'Edge · SuperWAN', href: solutionHref('edge', lang) },
 { label: 'Core', href: solutionHref('core', lang) },
 { label: lang === 'en' ? 'Cloud · Multi-cloud and SASE' : 'Cloud · Multicloud y SASE', href: solutionHref('cloud', lang) },
 { label: lang === 'en' ? 'IoT and SIM' : 'IoT y SIM', href: solutionHref('iot-sim', lang) }
];
export const industrySlugs = ['servicios-financieros', 'retail-franquicias', 'energia-industria', 'infraestructura-pagos', 'logistica-cadena-frio'];
export const industrySlugsEn = ['financial-services', 'retail-franchise', 'energy-industrial', 'payments-infrastructure', 'logistics-cold-chain'];
export const industryKeys = ['financial', 'retail', 'energy', 'payments', 'logistics'];
export const industryLinks = (lang: Lang) => (lang === 'en' ? industrySlugsEn : industrySlugs).map((slug, i) => ({
 label: t(industryKeys[i], 'Hero eyebrow', lang).replace(/^.*? · /, ''),
 href: `${lang === 'en' ? '/en/industries' : '/industrias'}/${slug}/`
}));
export function metadata(page: string, lang: Lang) {
 const combined = t(page, 'SEO title and meta description', lang);
 if (combined) { const [title, ...description] = split(combined); return { title, description: description.join(' · ') }; }
 if (page === 'faq') { const [title, , description] = split(t(page, 'SEO title, meta, hero', lang)); return { title, description }; }
 return { title: t(page, 'SEO title', lang), description: t(page, 'Meta description', lang) };
}
export function detail(page: string, slug: string, lang: Lang) {
 let problemTitle = t(page, 'Problem headline', lang), problem = t(page, 'Problem body', lang);
 if (!problemTitle) { const combined = t(page, 'Problem headline and body', lang); const at = combined.indexOf('. '); problemTitle = combined.slice(0, at + 1); problem = combined.slice(at + 2); }
 const featureKeys = Object.keys(tables[page]).filter(k => /^Features? \d/.test(k));
 const features = featureKeys.flatMap(k => items(t(page, k, lang)));
 return {
  slug, copyKey: page, lang, ...metadata(page, lang), seoTitle: metadata(page, lang).title,
  eyebrow: t(page, 'Hero eyebrow', lang), title: t(page, 'Hero headline', lang), description: t(page, 'Hero subhead', lang),
  problemTitle, problem,
  sectionTitle: t(page, 'Features headline', lang) || t(page, 'Use cases headline', lang) || (lang === 'en' ? 'What Vialterna does' : 'Qué hace Vialterna'),
  items: features.length ? features : items(t(page, 'Use cases', lang)),
  benefits: split(t(page, 'Benefits list', lang)), benefitsTitle: t(page, 'Benefits headline', lang) || (lang === 'en' ? 'Continuity designed around your operation.' : 'Continuidad diseñada alrededor de tu operación.')
 };
}
