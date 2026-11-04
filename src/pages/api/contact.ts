import type { APIRoute } from "astro";

export const prerender = false;

const formspreeAllowlist = new Set([
  "https://formspree.io/f/mzdnjgze"
]);

const text = (value: FormDataEntryValue | null) => typeof value === "string" ? value.trim() : "";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

const submitToFormspree = async (endpoint: string, formData: FormData) => {
  const payload = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key !== "formspreeEndpoint") payload.append(key, value);
  }
  payload.set("_subject", text(formData.get("subject")) || "Olivia Vialterna — solicitud de atención humana");

  return fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: payload
  });
};

const hubspotRequest = async (path: string, token: string, body: Record<string, unknown>) =>
  fetch(`https://api.hubapi.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

const submitToHubSpot = async (formData: FormData, request: Request) => {
  const token = import.meta.env.HUBSPOT_PRIVATE_APP_TOKEN || import.meta.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return { skipped: true };

  const name = text(formData.get("name"));
  const [firstname, ...lastParts] = name.split(/\s+/);
  const lastname = lastParts.join(" ");
  const email = text(formData.get("email"));
  const phone = text(formData.get("phone"));
  const company = text(formData.get("company"));
  const message = text(formData.get("message"));
  const language = text(formData.get("language"));

  const contactResponse = await hubspotRequest("/crm/v3/objects/contacts", token, {
      properties: {
        email,
        firstname: firstname || name,
        lastname,
        phone,
        company,
        lifecyclestage: "lead",
        hs_language: language,
        website: request.headers.get("referer") || "https://www.vialterna.com/contacto/"
      }
  });

  if (!contactResponse.ok && contactResponse.status !== 409) {
    const detail = await contactResponse.text().catch(() => "");
    console.error("HubSpot contact submission failed", contactResponse.status, detail);
    return { ok: false, contactStatus: contactResponse.status };
  }

  const pipeline = import.meta.env.HUBSPOT_DEAL_PIPELINE || "default";
  const dealstage = import.meta.env.HUBSPOT_DEAL_STAGE;
  if (!dealstage) return { ok: true, contactStatus: contactResponse.status, deal: { skipped: true } };

  const dealResponse = await hubspotRequest("/crm/v3/objects/deals", token, {
    properties: {
      dealname: `Website lead - ${company || name}`,
      pipeline,
      dealstage,
      description: message,
      source: "vialterna-website-contact-form"
    }
  });

  if (!dealResponse.ok) {
    const detail = await dealResponse.text().catch(() => "");
    console.error("HubSpot deal submission failed", dealResponse.status, detail);
    return { ok: true, contactStatus: contactResponse.status, deal: { ok: false, status: dealResponse.status } };
  }

  return { ok: true, contactStatus: contactResponse.status, deal: { ok: true, status: dealResponse.status } };
};

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const endpoint = text(formData.get("formspreeEndpoint"));
  const email = text(formData.get("email"));
  const name = text(formData.get("name"));
  const company = text(formData.get("company"));
  const phone = text(formData.get("phone"));

  if (!endpoint || !formspreeAllowlist.has(endpoint)) return json({ ok: false, error: "Invalid form endpoint" }, 400);
  if (!email || !name || !company || !phone) return json({ ok: false, error: "Missing required fields" }, 400);

  const [formspreeResult, hubspotResult] = await Promise.allSettled([
    submitToFormspree(endpoint, formData),
    submitToHubSpot(formData, request)
  ]);

  if (formspreeResult.status === "rejected" || !formspreeResult.value.ok) {
    const status = formspreeResult.status === "fulfilled" ? formspreeResult.value.status : 502;
    return json({ ok: false, error: "Form submission failed" }, status);
  }

  return json({
    ok: true,
    hubspot: hubspotResult.status === "fulfilled" ? hubspotResult.value : { ok: false }
  });
};
