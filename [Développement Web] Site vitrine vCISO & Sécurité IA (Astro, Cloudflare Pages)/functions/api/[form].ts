// Cloudflare Pages Function : POST /api/:form
// Validation stricte, puis relais Brevo (emails en texte brut) et liens de téléchargement signés.
// Même origine que le site : compatible avec la CSP form-action 'self'.
// À configurer côté Cloudflare : règle WAF de rate limiting sur /api/* (ex. 10 requêtes / minute / IP).
// Secrets : BREVO_API_KEY via `wrangler pages secret put`, jamais dans le dépôt.

import { RESOURCES as RESOURCE_LIST } from '../../src/data/resources';
import { DIAG_QUESTIONS } from '../../src/data/diagnostic';
import { sendText, newsletterDoubleOptIn, type BrevoEnv } from '../../server/brevo';
import { signDownload } from '../../server/sign';

type Env = Partial<BrevoEnv> & { SITE_ORIGIN?: string; DOWNLOAD_SECRET?: string };
type Ctx = { request: Request; env: Env; params: { form?: string } };

const MAX_BODY = 16 * 1024;
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,185}\.[a-z]{2,24}$/i;
const ANSWERS: Record<string, number> = { yes: 2, partial: 1, no: 0 };
const DIAG_IDS = DIAG_QUESTIONS.map((q) => q.id);
const RESOURCES = new Set(RESOURCE_LIST.map((r) => r.slug));
const LINK_TTL = 7 * 24 * 3600; // 7 jours, annoncé sur les pages ressources
const SUBJECTS = new Set(['vciso', 'ia', 'diagnostic', 'autre']);

type Spec = { required: string[]; max: Record<string, number> };
const FORMS: Record<string, Spec> = {
  'contact-submit': { required: ['name', 'company', 'email', 'subject', 'message', 'rgpd'], max: { name: 120, company: 160, email: 254, message: 4000 } },
  'diagnostic-submit': { required: ['name', 'company', 'email', 'rgpd', ...DIAG_IDS], max: { name: 120, company: 160, email: 254 } },
  'resource-download': { required: ['name', 'company', 'email', 'rgpd', 'resource'], max: { name: 120, company: 160, email: 254 } },
  'newsletter-subscribe': { required: ['email', 'rgpd'], max: { email: 254 } },
};

const fail = (status: number, msg: string) =>
  new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

const handlePost = async ({ request, env, params }: Ctx): Promise<Response> => {
  const form = params.form ?? '';
  if (!Object.hasOwn(FORMS, form)) return fail(404, 'Formulaire inconnu.');
  const spec = FORMS[form];

  // Anti-CSRF : origine obligatoire et identique au site
  const origin = request.headers.get('Origin');
  const expected = env.SITE_ORIGIN ?? new URL(request.url).origin;
  if (origin !== expected) return fail(403, 'Origine refusée.');

  const type = request.headers.get('Content-Type') ?? '';
  if (!type.startsWith('application/x-www-form-urlencoded') && !type.startsWith('multipart/form-data')) {
    return fail(415, 'Format non accepté.');
  }
  const len = Number(request.headers.get('Content-Length') ?? '0');
  if (len > MAX_BODY) return fail(413, 'Envoi trop volumineux.');

  const data = await request.formData();
  const get = (k: string) => (typeof data.get(k) === 'string' ? (data.get(k) as string).trim() : '');

  // Pot de miel : réponse identique à un succès pour ne pas renseigner le robot
  if (get('website') !== '') return Response.redirect(`${expected}/merci`, 303);

  for (const k of spec.required) if (!get(k)) return fail(400, `Champ manquant : ${k}.`);
  for (const [k, m] of Object.entries(spec.max)) if (get(k).length > m) return fail(400, `Champ trop long : ${k}.`);
  if (!EMAIL.test(get('email'))) return fail(400, 'Adresse email invalide.');
  if (get('rgpd') !== '1') return fail(400, 'Consentement requis.');

  const payload: Record<string, unknown> = {
    form,
    email: get('email').toLowerCase(),
    name: get('name') || undefined,
    company: get('company') || undefined,
    newsletter: get('newsletter') === '1',
    consentAt: new Date().toISOString(),
  };

  if (form === 'contact-submit') {
    if (!SUBJECTS.has(get('subject'))) return fail(400, 'Sujet invalide.');
    payload.subject = get('subject');
    payload.message = get('message');
  }
  if (form === 'resource-download') {
    if (!RESOURCES.has(get('resource'))) return fail(400, 'Ressource inconnue.');
    payload.resource = get('resource');
  }
  if (form === 'diagnostic-submit') {
    // Le score client est ignoré : recalcul serveur à partir des réponses
    let sum = 0;
    const answers: Record<string, string> = {};
    for (const id of DIAG_IDS) {
      const v = get(id);
      if (!Object.hasOwn(ANSWERS, v)) return fail(400, `Réponse invalide : ${id}.`);
      answers[id] = v;
      sum += ANSWERS[v];
    }
    payload.answers = answers;
    payload.score = Math.round((sum / (2 * DIAG_IDS.length)) * 100);
  }

  const brevo = env as BrevoEnv;
  if (!brevo.BREVO_API_KEY || !brevo.SENDER_EMAIL || !brevo.NOTIFY_EMAIL) {
    return fail(503, 'Service temporairement indisponible. Écrivez-nous par email.');
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
    if (!env.DOWNLOAD_SECRET) return fail(503, 'Service temporairement indisponible.');
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

  if (!ok) return fail(502, "L'envoi a échoué. Réessayez dans quelques minutes ou écrivez-nous par email.");

  return Response.redirect(`${expected}/merci`, 303);
};

export const onRequest = (ctx: Ctx) =>
  ctx.request.method === 'POST' ? handlePost(ctx) : Promise.resolve(fail(405, 'Méthode non autorisée.'));
