import type { APIRoute } from 'astro';
import { POST as submitContact } from './contact';
export const prerender = false;
const json = (error: string, status: number) => new Response(JSON.stringify({ok:false,error}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export const POST: APIRoute = async (context) => {
 const origin = context.request.headers.get('origin');
 if (!origin || origin !== new URL(context.request.url).origin) return json('Invalid origin',403);
 let data: FormData;
 try { data=await context.request.formData(); } catch { return json('Invalid form',400); }
 if(data.get('website_check'))return json('Invalid submission',400);
 for(const field of ['name','jobtitle','company','email','phone','sites','industry','message']){
  const value=data.get(field);
  if(typeof value!=='string'||!value.trim()||value.length>(field==='message'?5000:254))return json('Missing or invalid fields',400);
 }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get('email')))||data.get('consent')!=='yes')return json('Valid email and consent required',400);
 if(!['under-20','20-50','50-200','200-plus'].includes(String(data.get('sites'))))return json('Invalid site count',400);
 data.set('subject','Vialterna — Solicitud de auditoría Telco / Telco audit request');
 data.set('message',`Job title / Puesto: ${data.get('jobtitle')}\nSites / Sitios: ${data.get('sites')}\nIndustry / Industria: ${data.get('industry')}\n\n${data.get('message')}`);
 data.set('formspreeEndpoint','https://formspree.io/f/mzdnjgze');
 data.delete('website_check');
 return submitContact({...context, request:new Request(context.request.url,{method:'POST',headers:{referer:context.request.headers.get('referer')||context.request.url},body:data})});
};
