import flags from '../data/v3/changes.json';
import { tables, split, plain, stripButton, item, industrySlugs, industrySlugsEn, industryKeys, type Lang } from './v3';
export type Change = 'new' | 'changed' | 'same';
const changes=flags as Record<string,Record<string,Record<Lang,Change>>>;
export const changeStatus=(page:string,key:string,lang:Lang):Change=>changes[page]?.[key]?.[lang]??'same';
// Match rendered editorial blocks, keeping markup and the approved copy intact.
import { normalizeReviewText } from './review-text';

function pageForPath(path:string){
 if(['/','/en/'].includes(path))return 'home';
 if(path.includes('/insights/'))return '';
 if(path.includes('/solutions/')||path.includes('/soluciones/'))return path.split('/').filter(Boolean).at(-1)??'';
 if(path.includes('/industries/')||path.includes('/industrias/')){
  const slug=path.split('/').filter(Boolean).at(-1)??'';
  const i=industrySlugs.indexOf(slug),j=industrySlugsEn.indexOf(slug);
  return industryKeys[i>=0?i:j]??'';
 }
 const slug=path.split('/').filter(Boolean).at(-1);
 return ({empresa:'company',company:'company',faq:'faq',contacto:'contact',contact:'contact','auditoria-telco':'audit','telco-audit':'audit'} as Record<string,string>)[slug??'']??'';
}
export function reviewData(path:string,lang:Lang){
 const page=pageForPath(path);
 const pages=[page,'global',...(['home','edge-to-cloud'].includes(page)?['home']:[])];
 const candidates=new Map<string,Change>();
 for(const name of new Set(pages)){
  for(const [key,copy] of Object.entries(tables[name]??{})){
   if(/SEO|Meta description/.test(key))continue;
   const state=changeStatus(name,key,lang);
   if(state==='same')continue;
   const value=copy[lang];
   const fragments=[value,stripButton(value),plain(value)];
   for(const part of split(stripButton(value))){
    const parsed=item(part);fragments.push(part,parsed.title,parsed.text);
    if(part.includes(' ('))fragments.push(part.split(' (')[0],part.slice(part.indexOf(' (')+2).replace(/\)$/,''));
   }
   // Rich blocks render bold headings and paragraph bodies separately.
   const bold=value.match(/^\*\*(.*?)\*\*\s*(.*)$/s);
   if(bold)fragments.push(bold[1],bold[2]);
   for(const fragment of fragments){
    const normalized=normalizeReviewText(fragment);
    if(normalized.length>=14)candidates.set(normalized,state);
   }
  }
 }
 return {page,newPage:['cloud','edge-to-cloud'].includes(page),entries:[...candidates]};
}
