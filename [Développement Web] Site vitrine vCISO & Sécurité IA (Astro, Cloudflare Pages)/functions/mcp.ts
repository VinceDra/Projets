// POST /mcp : serveur MCP public en lecture seule (voir docs/mcp-spec.md).
// Désactivé par défaut : définir MCP_ENABLED="true" pour l'ouvrir, après la règle WAF de rate limiting.
// Sans état, JSON-RPC 2.0, réponses application/json uniquement.
import { ARTICLES } from '../src/data/blog';
import { RESOURCES } from '../src/data/resources';
import { OFFERS, SITE } from '../src/data/site';

type Env = { MCP_ENABLED?: string };
type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: any };

// À CONFIRMER : révisions du protocole à la date de mise en service (modelcontextprotocol.io)
const SUPPORTED = ['2025-06-18', '2025-03-26'];
const MAX_BODY = 8 * 1024;
const SLUG = /^[a-z0-9-]{1,80}$/;
const CATEGORIES = ['Gouvernance', 'Sécurité IA', 'Conformité', 'Crise', 'Investissement'];
const U = SITE.url;

const noArgs = { type: 'object', properties: {}, additionalProperties: false };
const TOOLS = [
  { name: 'list_articles', description: 'Liste les articles du blog avec leurs métadonnées.',
    inputSchema: { type: 'object', properties: { category: { type: 'string', enum: CATEGORIES } }, additionalProperties: false } },
  { name: 'get_article', description: "Contenu complet, FAQ et sources d'un article.",
    inputSchema: { type: 'object', required: ['slug'], properties: { slug: { type: 'string', pattern: SLUG.source } }, additionalProperties: false } },
  { name: 'list_resources', description: 'Liste les guides et checklists téléchargeables.', inputSchema: noArgs },
  { name: 'get_services', description: 'Détaille les 2 offres : vCISO et Sécurité IA.', inputSchema: noArgs },
  { name: 'contact_info', description: 'Modalités de contact et de prise de rendez-vous.', inputSchema: noArgs },
].map((t) => ({ ...t, annotations: { readOnlyHint: true, openWorldHint: false } }));

class ParamError extends Error {}

function run(name: string, args: Record<string, unknown>): { data: unknown; isError?: boolean } {
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
      return { data: { resources: RESOURCES.map((r) => ({ slug: r.slug, type: r.type, title: r.title, description: r.description, url: `${U}/ressources/${r.slug}` })) } };
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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const err = (id: Rpc['id'], code: number, message: string) => json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

function handle(m: Rpc): object | null {
  if (m?.jsonrpc !== '2.0' || typeof m.method !== 'string') return { jsonrpc: '2.0', id: m?.id ?? null, error: { code: -32600, message: 'Invalid Request' } };
  if (m.id === undefined) return null; // notification : pas de réponse
  const ok = (result: unknown) => ({ jsonrpc: '2.0', id: m.id, result });
  try {
    switch (m.method) {
      case 'initialize': {
        const asked = m.params?.protocolVersion;
        return ok({ protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
          capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'vd-cybersec', version: '1.0.0' } });
      }
      case 'ping': return ok({});
      case 'tools/list': return ok({ tools: TOOLS });
      case 'tools/call': {
        const name = m.params?.name;
        const args = m.params?.arguments ?? {};
        if (typeof name !== 'string' || typeof args !== 'object' || Array.isArray(args) || args === null) throw new ParamError('Paramètres invalides.');
        const r = run(name, args);
        return ok({ structuredContent: r.data, content: [{ type: 'text', text: JSON.stringify(r.data) }], isError: !!r.isError });
      }
      default: return { jsonrpc: '2.0', id: m.id, error: { code: -32601, message: 'Method not found' } };
    }
  } catch (e) {
    if (e instanceof ParamError) return { jsonrpc: '2.0', id: m.id, error: { code: -32602, message: e.message } };
    return { jsonrpc: '2.0', id: m.id, error: { code: -32603, message: 'Internal error' } }; // aucun détail exposé
  }
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  if (env.MCP_ENABLED !== 'true') return new Response('Not found', { status: 404 });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  if (!(request.headers.get('Content-Type') ?? '').startsWith('application/json')) return new Response('Unsupported Media Type', { status: 415 });
  const text = await request.text();
  if (text.length > MAX_BODY) return new Response('Payload Too Large', { status: 413 });
  let msg: Rpc | Rpc[];
  try { msg = JSON.parse(text); } catch { return err(null, -32700, 'Parse error'); }
  if (Array.isArray(msg)) return err(null, -32600, 'Batch non supporté');
  const out = handle(msg);
  return out ? json(out) : new Response(null, { status: 202 });
};
