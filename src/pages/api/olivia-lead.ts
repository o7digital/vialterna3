import type { APIRoute } from "astro";

export const prerender = false;

const allowedHosts = new Set(["vialterna.com", "www.vialterna.com", "vialterna2.vercel.app", "vialterna3.vercel.app"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hubspotFormUrl = "https://api.hsforms.com/submissions/v3/integration/submit/51161603/d8ae4cdc-017f-4193-b687-873d987d52a9";

const clean = (value: unknown, maxLength = 500) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  let originHost = "";
  try {
    originHost = origin ? new URL(origin).hostname.toLowerCase() : "";
  } catch {
    return json({ ok: false, error: "Invalid origin" }, 403);
  }
  if (!allowedHosts.has(originHost)) return json({ ok: false, error: "Invalid origin" }, 403);

  const payload = await request.json().catch(() => ({}));
  const name = clean(payload.name, 120);
  const email = clean(payload.email, 254).toLowerCase();
  const phone = clean(payload.phone, 50);
  const company = clean(payload.company, 120);
  const language = clean(payload.language, 5);

  if (payload.consent !== true) return json({ ok: false, error: "Consent required" }, 400);
  if (!emailPattern.test(email) || !name) return json({ ok: false, error: "Name and valid email required" }, 400);

  const fields = [
    { objectTypeId: "0-1", name: "email", value: email },
    { objectTypeId: "0-1", name: "firstname", value: name },
    { objectTypeId: "0-1", name: "phone", value: phone },
    { objectTypeId: "0-1", name: "company", value: company || "No especificada - Olivia AI" }
  ];

  const hubspotResponse = await fetch(hubspotFormUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submittedAt: Date.now().toString(),
      fields,
      context: {
        pageUri: request.headers.get("referer") || "https://www.vialterna.com/",
        pageName: `Olivia AI - Vialterna (${language || "es"})`
      },
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: "Acepto compartir mis datos para recibir atención de Vialterna."
        }
      }
    })
  });
  if (!hubspotResponse.ok) {
    console.error("Olivia HubSpot form submission failed", hubspotResponse.status);
    return json({ ok: false, error: "CRM submission failed" }, 502);
  }

  return json({ ok: true, submitted: true, source: "olivia-ai" });
};
