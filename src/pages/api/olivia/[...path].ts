import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
export const prerender = false;
const cookieName = 'vialterna3_olivia36';
const secret = () => import.meta.env.OLIVIA_V36_GATEWAY_KEY || '';
const equal = (left: string, right: string) => { const a = Buffer.from(left), b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); };
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const ALL: APIRoute = async ({ request, params, cookies, clientAddress }) => {
  if (!secret()) return json({ ok: false, error: 'Olivia v3.6 is not configured' }, 503);
  const path = params.path;
  const origin = request.headers.get('origin');
  const requestedOrigin = new URL(request.url).origin;
  if ((origin && origin !== requestedOrigin) || request.headers.get('sec-fetch-site') === 'cross-site') return json({ ok: false, error: 'Invalid origin' }, 403);
  const stored = cookies.get(cookieName)?.value || '';
  const [id, expires, signature] = stored.split('.');
  const valid = /^[a-f0-9]{32}$/.test(id || '') && /^\d+$/.test(expires || '') && Number(expires) > Date.now() && equal(signature || '', sign(`session:${id}.${expires}`));

  if (request.method === 'GET' && path === 'session') {
    const sessionId = valid ? id : randomBytes(16).toString('hex');
    if (!valid) {
      const expiry = String(Date.now() + 24 * 60 * 60 * 1000);
      cookies.set(cookieName, `${sessionId}.${expiry}.${sign(`session:${sessionId}.${expiry}`)}`, { httpOnly: true, secure: requestedOrigin.startsWith('https:'), sameSite: 'strict', path: '/api/olivia', maxAge: 86400 });
    }
    return json({ clientCode: 'vialterna3-demo', identity: sign(`widget:${sessionId}`), version: '3.6.0' });
  }
  if (request.method !== 'POST' || path !== 'chat') return json({ ok: false, error: 'Not found' }, 404);
  if (!origin || origin !== requestedOrigin) return json({ ok: false, error: 'Origin required' }, 403);
  if (!valid || !equal(request.headers.get('x-olivia-widget-identity') || '', sign(`widget:${id}`))) return json({ ok: false, error: 'Session expired' }, 401);
  if (Number(request.headers.get('content-length') || 0) > 24000) return json({ ok: false, error: 'Request too large' }, 413);
  let payload: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 24000) return json({ ok: false, error: 'Request too large' }, 413);
    payload = JSON.parse(text);
  } catch { return json({ ok: false, error: 'Invalid JSON' }, 400); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return json({ ok: false, error: 'Invalid payload' }, 400);
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const visitorId = typeof payload.visitorId === 'string' ? payload.visitorId : '';
  const metadata = payload.metadata as Record<string, unknown> | undefined;
  if (!message || message.length > 4000 || !/^[a-f0-9-]{32,36}$/i.test(visitorId)) return json({ ok: false, error: 'Invalid message' }, 400);
  if (metadata?.dataConsent !== true) return json({ ok: false, error: 'Consent required' }, 400);
  const language = ['es', 'en', 'fr'].includes(String(payload.language)) ? String(payload.language) : 'es';
  const endpoint = import.meta.env.OLIVIA_V36_GATEWAY_URL || 'https://olivia.o7digitalgroup.com/vialterna-demo';
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, '')}/chat`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(55000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret()}` },
      body: JSON.stringify({ message, language, consent: true, conversation_id: sign(`conversation:${id}:${visitorId}`).slice(0, 48), session_id: id, client_hash: createHash('sha256').update(request.headers.get('x-vercel-forwarded-for') || clientAddress || id).digest('hex') })
    });
    if (!response.ok) return json({ ok: false, error: response.status === 429 ? 'Please wait before sending another message' : 'Olivia is temporarily unavailable' }, response.status === 429 ? 429 : 502);
    const body = await response.json();
    return json(body);
  } catch { return json({ ok: false, error: 'Olivia is temporarily unavailable' }, 502); }
};
