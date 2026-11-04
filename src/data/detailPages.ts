import { detail, industryKeys, industrySlugs } from '../lib/v3';
export type DetailPage = {
  slug: string;
  copyKey?: string;
  seoTitle?: string;
  benefitsTitle?: string;
  eyebrow: string;
  title: string;
  description: string;
  problemTitle?: string;
  problem?: string;
  sectionTitle: string;
  items: { title: string; text: string }[];
  benefits: string[];
};


export const solutionPages: DetailPage[] = ['edge', 'core', 'cloud', 'iot-sim'].map(slug => detail(slug, slug, 'es'));
export const industryPages: DetailPage[] = industryKeys.map((key, i) => detail(key, industrySlugs[i], 'es'));
