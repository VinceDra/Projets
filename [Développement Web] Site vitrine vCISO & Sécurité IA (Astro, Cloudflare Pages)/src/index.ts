// Worker unique (Workers + assets) : routes dynamiques + fallback vers les fichiers statiques de dist/.
// Remplace l'ancien modèle Pages Functions (functions/) : ce projet Cloudflare est un Worker, pas un
// projet Pages. Les assets statiques sont servis automatiquement par la plateforme pour toute requête
// qui correspond à un fichier de dist/ (voir [assets] dans wrangler.toml) ; ce Worker n'est invoqué que
// pour /api/*, /mcp, /telechargement, et pour les chemins qui ne correspondent à aucun fichier (404).
import { RESOURCES as RESOURCE_LIST } from './data/resources';
import { DIAG_QUESTIONS } from './data/diagnostic';
import { ARTICLES } from './data/blog';
import { OFFERS, SITE } from './data/site';
import { sendText, newsletterDoubleOptIn, type BrevoEnv } from '../server/brevo';
import { signDownload, verifyDownload } from '../server/sign';

type R2Obj = { body: ReadableStream };
type Env = Partial<BrevoEnv> & {
  SITE_ORIGIN?: string;
  DOWNLOAD_SECRET?: string;
  MCP_ENABLED?: string;
  PDF_BUCKET?: { get(key: string): Promise<R2Obj | null> };
  ASSETS: { fetch(request: Request): Promise<Response> };
};

const text = (status: number, msg: string) =>
  new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
const methodNotAllowed = (allow: string) => new Response('Méthode non autorisée.', { status: 405, headers: { Allow: allow } });

// --- POST /api/:form -----------------------------------------------------
// Validation stricte, puis relais Brevo (emails en texte brut) et liens de téléchargement signés.
// Même origine que le site : compatible avec la CSP form-action 'self'.
// À configurer côté Cloudflare : règle WAF de rate limiting sur /api/* (ex. 10 requêtes / minute / IP).
// Secrets : BREVO_API_KEY via `wrangler secret put`, jamais dans le dépôt.

const MAX_FORM_BODY = 16 * 1024;
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,185}\.[a-z]{2,24}$/i;
const ANSWERS: Record<string, number> = { yes: 2, partial: 1, no: 0 };
const DIAG_IDS = DIAG_QUESTIONS.map((q) => q.id);
const RESOURCE_SLUGS = new Set(RESOURCE_LIST.map((r) => r.slug));
const LINK_TTL = 7 * 24 * 3600; // 7 jours, annoncé sur les pages ressources
const SUBJECTS = new Set(['vciso', 'ia', 'diagnostic', 'autre']);

type FormSpec = { required: string[]; max: Record<string, number> };
const FORMS: Record<string, FormSpec> = {
  'contact-submit': { required: ['name', 'company', 'email', 'subject', 'message', 'rgpd'], max: { name: 120, company: 160, email: 254, message: 4000 } },
  'diagnostic-submit': { required: ['name', 'company', 'email', 'rgpd', ...DIAG_IDS], max: { name: 120, company: 160, email: 254 } },
  'resource-download': { required: ['name', 'company', 'email', 'rgpd', 'resource'], max: { name: 120, company: 160, email: 254 } },
  'newsletter-subscribe': { required: ['email', 'rgpd'], max: { email: 254 } },
};

async function handleFormPost(request: Request, env: Env, form: string): Promise<Response> {
  if (!Object.hasOwn(FORMS, form)) return text(404, 'Formulaire inconnu.');
  const spec = FORMS[form];

  // Anti-CSRF : origine obligatoire et identique au site
  const origin = request.headers.get('Origin');
  const expected = env.SITE_ORIGIN ?? new URL(request.url).origin;
  if (origin !== expected) return text(403, 'Origine refusée.');

  const type = request.headers.get('Content-Type') ?? '';
  if (!type.startsWith('application/x-www-form-urlencoded') && !type.startsWith('multipart/form-data')) {
    return text(415, 'Format non accepté.');
  }
  const len = Number(request.headers.get('Content-Length') ?? '0');
  if (len > MAX_FORM_BODY) return text(413, 'Envoi trop volumineux.');

  const data = await request.formData();
  const get = (k: string) => (typeof data.get(k) === 'string' ? (data.get(k) as string).trim() : '');

  // Pot de miel : réponse identique à un succès pour ne pas renseigner le robot
  if (get('website') !== '') return Response.redirect(`${expected}/merci`, 303);

  for (const k of spec.required) if (!get(k)) return text(400, `Champ manquant : ${k}.`);
  for (const [k, m] of Object.entries(spec.max)) if (get(k).length > m) return text(400, `Champ trop long : ${k}.`);
  if (!EMAIL.test(get('email'))) return text(400, 'Adresse email invalide.');
  if (get('rgpd') !== '1') return text(400, 'Consentement requis.');

  const payload: Record<string, unknown> = {
    form,
    email: get('email').toLowerCase(),
    name: get('name') || undefined,
    company: get('company') || undefined,
    newsletter: get('newsletter') === '1',
    consentAt: new Date().toISOString(),
  };

  if (form === 'contact-submit') {
    if (!SUBJECTS.has(get('subject'))) return text(400, 'Sujet invalide.');
    payload.subject = get('subject');
    payload.message = get('message');
  }
  if (form === 'resource-download') {
    if (!RESOURCE_SLUGS.has(get('resource'))) return text(400, 'Ressource inconnue.');
    payload.resource = get('resource');
  }
  if (form === 'diagnostic-submit') {
    // Le score client est ignoré : recalcul serveur à partir des réponses
    let sum = 0;
    const answers: Record<string, string> = {};
    for (const id of DIAG_IDS) {
      const v = get(id);
      if (!Object.hasOwn(ANSWERS, v)) return text(400, `Réponse invalide : ${id}.`);
      answers[id] = v;
      sum += ANSWERS[v];
    }
    payload.answers = answers;
    payload.score = Math.round((sum / (2 * DIAG_IDS.length)) * 100);
  }

  const brevo = env as BrevoEnv;
  if (!brevo.BREVO_API_KEY || !brevo.SENDER_EMAIL || !brevo.NOTIFY_EMAIL) {
    return text(503, 'Service temporairement indisponible. Écrivez-nous par email.');
  }

  const email = payload.email as string;
  const lines = (o: Record<string, unknown>) =>
    Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
  let ok = true;

  if (form === 'contact-submit' || form === 'diagnostic-submit') {
    // Notification interne ; "Répondre" écrit directement au demandeur
    ok = await sendText(brevo, brevo.NOTIFY_EMAIL, `[site] ${form}`, lines(payload), email);
  }

  if (form === 'resource-download') {
    if (!env.DOWNLOAD_SECRET) return text(503, 'Service temporairement indisponible.');
    const r = RESOURCE_LIST.find((x) => x.slug === payload.resource)!;
    const t = await signDownload(env.DOWNLOAD_SECRET, r.slug, LINK_TTL);
    const link = `${expected}/telechargement?r=${r.slug}&e=${t.exp}&s=${t.sig}`;
    // Contenu fixe : le nom saisi n'est pas repris, pour empêcher l'usage du formulaire comme relais de spam
    ok = await sendText(brevo, email, r.title,
      `Bonjour,\n\nVoici votre document « ${r.title} » :\n${link}\n\nLe lien expire dans 7 jours.\n\nVD\n${expected}`);
  }

  if (payload.newsletter || form === 'newsletter-subscribe') {
    const doi = await newsletterDoubleOptIn(brevo, email, expected);
    if (form === 'newsletter-subscribe') ok = doi;
  }

  if (!ok) return text(502, "L'envoi a échoué. Réessayez dans quelques minutes ou écrivez-nous par email.");

  return Response.redirect(`${expected}/merci`, 303);
}

// --- GET /telechargement ---------------------------------------------------
// Sert un PDF depuis R2 (binding PDF_BUCKET) si la signature HMAC est valide.

async function handleDownload(request: Request, env: Env): Promise<Response> {
  const u = new URL(request.url);
  const r = u.searchParams.get('r') ?? '';
  const res = RESOURCE_LIST.find((x) => x.slug === r);
  if (!res || !env.DOWNLOAD_SECRET || !env.PDF_BUCKET) return text(404, 'Lien invalide.');
  const valid = await verifyDownload(env.DOWNLOAD_SECRET, r, u.searchParams.get('e') ?? '', u.searchParams.get('s') ?? '');
  if (!valid) return text(403, 'Lien expiré ou invalide. Redemandez le document depuis la page ressource.');
  const obj = await env.PDF_BUCKET.get(`${res.slug}.pdf`);
  if (!obj) return text(404, 'Document indisponible.');
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${res.slug}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

// --- POST /mcp ---------------------------------------------------------
// Serveur MCP public en lecture seule (voir docs/mcp-spec.md).
// Désactivé par défaut : définir MCP_ENABLED="true" pour l'ouvrir, après la règle WAF de rate limiting.
// Sans état, JSON-RPC 2.0, réponses application/json uniquement.

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: any };

// À CONFIRMER : révisions du protocole à la date de mise en service (modelcontextprotocol.io)
const MCP_SUPPORTED = ['2025-06-18', '2025-03-26'];
const MAX_MCP_BODY = 8 * 1024;
const SLUG = /^[a-z0-9-]{1,80}$/;
const CATEGORIES = ['Gouvernance', 'Sécurité IA', 'Conformité', 'Crise', 'Investissement'];
const U = SITE.url;

const noArgs = { type: 'object', properties: {}, additionalProperties: false };
const MCP_TOOLS = [
  { name: 'list_articles', description: 'Liste les articles du blog avec leurs métadonnées.',
    inputSchema: { type: 'object', properties: { category: { type: 'string', enum: CATEGORIES } }, additionalProperties: false } },
  { name: 'get_article', description: "Contenu complet, FAQ et sources d'un article.",
    inputSchema: { type: 'object', required: ['slug'], properties: { slug: { type: 'string', pattern: SLUG.source } }, additionalProperties: false } },
  { name: 'list_resources', description: 'Liste les guides et checklists téléchargeables.', inputSchema: noArgs },
  { name: 'get_services', description: 'Détaille les 2 offres : vCISO et Sécurité IA.', inputSchema: noArgs },
  { name: 'contact_info', description: 'Modalités de contact et de prise de rendez-vous.', inputSchema: noArgs },
].map((t) => ({ ...t, annotations: { readOnlyHint: true, openWorldHint: false } }));

class ParamError extends Error {}

function runMcpTool(name: string, args: Record<string, unknown>): { data: unknown; isError?: boolean } {
  const keys = Object.keys(args);
  const only = (allowed: string[]) => { if (keys.some((k) => !allowed.includes(k))) throw new ParamError('Argument inconnu.'); };
  switch (name) {
    case 'list_articles': {
      only(['category']);
      const c = args.category;
      if (c !== undefined && !CATEGORIES.includes(c as string)) throw new ParamError('Catégorie invalide.');
      return { data: { articles: ARTICLES.filter((a) => !c || a.category === c).map((a) => ({
        slug: a.slug, title: a.title, category: a.category, kind: a.kind, excerpt: a.excerpt,
        publishedAt: a.publishedAt, readingMinutes: a.readingMinutes, url: `${U}/blog/${a.slug}` })) } };
    }
    case 'get_article': {
      only(['slug']);
      const s = args.slug;
      if (typeof s !== 'string' || !SLUG.test(s)) throw new ParamError('Slug invalide.');
      const a = ARTICLES.find((x) => x.slug === s);
      if (!a) return { data: { error: 'Article introuvable.' }, isError: true };
      return { data: { slug: a.slug, title: a.title, category: a.category, publishedAt: a.publishedAt, url: `${U}/blog/${a.slug}`,
        body: a.body, faq: a.faq, sources: a.sources, disclaimer: "Contenu informatif, non constitutif d'un avis juridique." } };
    }
    case 'list_resources':
      only([]);
      return { data: { resources: RESOURCE_LIST.map((r) => ({ slug: r.slug, type: r.type, title: r.title, description: r.description, url: `${U}/ressources/${r.slug}` })) } };
    case 'get_services':
      only([]);
      return { data: { services: OFFERS.map((o) => ({ id: o.id, name: o.name, format: o.format, summary: o.summary,
        deliverables: o.deliverables.map((d) => d.title), url: `${U}/services#${o.id}` })) } };
    case 'contact_info':
      only([]);
      return { data: { contactUrl: `${U}/contact`, firstStep: 'Session de cadrage de 30 minutes', responseTime: '2 jours ouvrés',
        languages: ['fr', 'en'], securityContact: `${U}/.well-known/security.txt` } };
    default:
      throw new ParamError('Outil inconnu.');
  }
}

const mcpJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const mcpErr = (id: Rpc['id'], code: number, message: string) => mcpJson({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

function handleMcpMessage(m: Rpc): object | null {
  if (m?.jsonrpc !== '2.0' || typeof m.method !== 'string') return { jsonrpc: '2.0', id: m?.id ?? null, error: { code: -32600, message: 'Invalid Request' } };
  if (m.id === undefined) return null; // notification : pas de réponse
  const ok = (result: unknown) => ({ jsonrpc: '2.0', id: m.id, result });
  try {
    switch (m.method) {
      case 'initialize': {
        const asked = m.params?.protocolVersion;
        return ok({ protocolVersion: MCP_SUPPORTED.includes(asked) ? asked : MCP_SUPPORTED[0],
          capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'vd-cybersec', version: '1.0.0' } });
      }
      case 'ping': return ok({});
      case 'tools/list': return ok({ tools: MCP_TOOLS });
      case 'tools/call': {
        const name = m.params?.name;
        const args = m.params?.arguments ?? {};
        if (typeof name !== 'string' || typeof args !== 'object' || Array.isArray(args) || args === null) throw new ParamError('Paramètres invalides.');
        const r = runMcpTool(name, args);
        return ok({ structuredContent: r.data, content: [{ type: 'text', text: JSON.stringify(r.data) }], isError: !!r.isError });
      }
      default: return { jsonrpc: '2.0', id: m.id, error: { code: -32601, message: 'Method not found' } };
    }
  } catch (e) {
    if (e instanceof ParamError) return { jsonrpc: '2.0', id: m.id, error: { code: -32602, message: e.message } };
    return { jsonrpc: '2.0', id: m.id, error: { code: -32603, message: 'Internal error' } }; // aucun détail exposé
  }
}

async function handleMcp(request: Request, env: Env): Promise<Response> {
  if (env.MCP_ENABLED !== 'true') return new Response('Not found', { status: 404 });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  if (!(request.headers.get('Content-Type') ?? '').startsWith('application/json')) return new Response('Unsupported Media Type', { status: 415 });
  const body = await request.text();
  if (body.length > MAX_MCP_BODY) return new Response('Payload Too Large', { status: 413 });
  let msg: Rpc | Rpc[];
  try { msg = JSON.parse(body); } catch { return mcpErr(null, -32700, 'Parse error'); }
  if (Array.isArray(msg)) return mcpErr(null, -32600, 'Batch non supporté');
  const out = handleMcpMessage(msg);
  return out ? mcpJson(out) : new Response(null, { status: 202 });
}

// --- Routage -------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return request.method === 'POST'
        ? handleFormPost(request, env, url.pathname.slice('/api/'.length))
        : methodNotAllowed('POST');
    }
    if (url.pathname === '/telechargement') {
      return request.method === 'GET' ? handleDownload(request, env) : methodNotAllowed('GET');
    }
    if (url.pathname === '/mcp') {
      return handleMcp(request, env);
    }

    // Tout le reste : fichiers statiques de dist/. Cloudflare sert directement les chemins qui
    // correspondent à un fichier avant même d'invoquer ce Worker ; on n'atteint ce point que pour
    // les chemins sans correspondance, auquel cas `not_found_handling = "404-page"` (wrangler.toml)
    // fait retourner le contenu de dist/404.html avec un statut 404.
    return env.ASSETS.fetch(request);
  },
};
