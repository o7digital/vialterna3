import type { DetailPage } from './detailPages';
import { detail, industryKeys, industrySlugsEn } from '../lib/v3';
export const solutionPagesEn: DetailPage[] = ['edge', 'core', 'cloud', 'iot-sim'].map(slug => detail(slug, slug, 'en'));
export const industryPagesEn: DetailPage[] = industryKeys.map((key, i) => detail(key, industrySlugsEn[i], 'en'));
const page = (
  slug: string, eyebrow: string, title: string, description: string,
  problemTitle: string, problem: string, sectionTitle: string,
  items: [string, string][], benefits: string[]
): DetailPage => ({
  slug, eyebrow, title, description, problemTitle, problem, sectionTitle,
  items: items.map(([title, text]) => ({ title, text })), benefits
});

export const platformPagesEn: DetailPage[] = [
  page("air-connect", "The platform behind every engagement", "AIrConnect: every site, device, and network in one platform.",
    "Real-time monitoring, intelligent routing, proactive incident response, and consolidated reporting across your footprint.",
    "A platform, not a product.",
    "AIrConnect powers our managed service and gives you one view of uptime, performance, incidents, providers, SIMs, sensors, and cost.",
    "Enter. Design. Deploy. Manage and expand.",
    [["Enter", "Start with the free Telco audit or a specific operational need."], ["Design", "Build the optimal network and technology mix from your data."], ["Deploy", "Activate hardware, networks, and monitoring without interrupting operations."], ["Manage and expand", "Continuously monitor, optimize, and scale."]],
    ["Full estate visibility", "Proactive incident response", "Consolidated SLA reporting"])
];
