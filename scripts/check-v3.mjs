import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { getBuildOutputDirectory } from './build-output.mjs';
const dist=getBuildOutputDirectory();
const read=route=>readFileSync(join(dist,route,'index.html'),'utf8');
const content=html=>html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
const home=read(''),english=read('en');
assert.match(home,/Las redes se caen/);assert.match(home,/Tu operación sigue/);
assert.match(english,/Your operation keeps running/);
for(const route of ['', 'en','soluciones/edge-to-cloud','en/solutions/edge-to-cloud']){
 const html=read(route);
 assert.equal((html.match(/class="v3-path-card"/g)||[]).length,route==='en'||route===''?3:0);
 assert.match(html,/class="v3-stack"/);assert.match(html,/AIrConnect/);assert.match(html,/peplink.svg/);assert.match(html,/alkira.png/);
}
for(const lang of ['es','en']){
 const prefix=lang==='en'?'en/solutions':'soluciones';
 const audit=lang==='en'?'/en/telco-audit/':'/auditoria-telco/';
 for(const slug of ['edge','core','cloud','iot-sim','edge-to-cloud']){
  const html=read(`${prefix}/${slug}`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,new RegExp(`hreflang="${lang==='en'?'es-MX':'en'}"`));
  assert.ok(html.includes(`href="${audit}"`));
  assert.ok(!content(html).includes('Telco as a Service'));
 }
 const edge=read(`${prefix}/edge`),core=read(`${prefix}/core`),cloud=read(`${prefix}/cloud`);
 assert.match(edge,/99.95%/);assert.match(core,/99.99%/);
 assert.match(core,new RegExp(`href="/${prefix}/cloud/"`));
 assert.match(cloud,/Alkira Cloud Exchange Point/);assert.match(cloud,/Nemertes 2024/);
 const faq=read(lang==='en'?'en/faq':'faq');
 assert.equal((faq.match(/<details>/g)||[]).length,15);
 assert.match(faq,/"@type":"FAQPage"/);
 const form=read(lang==='en'?'en/telco-audit':'auditoria-telco');
 for(const field of ['name','jobtitle','company','email','phone','sites','industry','message','consent'])assert.ok(form.includes(`name="${field}"`),`Missing audit field ${field}`);
 assert.match(form,/id="audit-form"/);assert.match(form,/href="#audit-form"/);
}
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
const pages=walk(dist).filter(p=>p.endsWith('index.html'));
for(const file of pages){
 const html=readFileSync(file,'utf8');if(html.includes('http-equiv="refresh"'))continue;
 const route=relative(dist,file);
 assert.match(html,/<meta name="robots" content="noindex,follow"/,`Review site must be noindex: ${route}`);
 assert.ok(!html.includes('location.replace(url.toString())'),`Legacy reload remains in ${route}`);
 assert.ok(!html.includes("})(window,document,'script','dataLayer','GTM-"),`Production analytics active on ${route}`);
 for(const match of html.matchAll(/(?:src|href)="(\/(?:brand|images|_astro)\/[^"?#]+)"/g))assert.ok(existsSync(join(dist,match[1])),`Missing asset ${match[1]} on ${route}`);
}
const sitemap=readFileSync(join(dist,'sitemap.xml'),'utf8');
assert.match(sitemap,/\/soluciones\/edge-to-cloud\//);assert.match(sitemap,/\/en\/solutions\/cloud\//);
assert.ok(!sitemap.includes('/telco-as-a-service/'));
assert.match(sitemap,/\/insights\/costo-downtime-retail-mexico\//);
assert.match(sitemap,/\/en\/insights\/retail-downtime-cost-mexico\//);
const config=JSON.parse(readFileSync('vercel.json','utf8'));
for(const source of ['/en/industries','/soluciones/telco-as-a-service','/en/solutions/telco-as-a-service']) for(const suffix of ['', '/']) assert.ok(config.redirects.some(r=>r.source===source+suffix&&r.statusCode===301));
assert.ok(config.headers[0].headers.some(h=>h.key==='X-Robots-Tag'&&h.value.includes('noindex')));
if(existsSync('.vercel/project.json')) assert.equal(JSON.parse(readFileSync('.vercel/project.json','utf8')).projectName,'vialterna3');
console.log(`V3 regression checks passed: structure, audit fields, bilingual routes, 15 FAQs per language, assets, staging isolation (${pages.length} generated pages).`);
