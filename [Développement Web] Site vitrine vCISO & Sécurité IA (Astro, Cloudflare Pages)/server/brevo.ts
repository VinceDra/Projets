// Client Brevo minimal (API v3). Endpoints et champs À VÉRIFIER sur developers.brevo.com avant mise en production.
// Tout contenu saisi par l'utilisateur part en texte brut (textContent) : aucune injection HTML possible dans les emails.

export type BrevoEnv = {
  BREVO_API_KEY: string;
  SENDER_EMAIL: string;         // expéditeur vérifié dans Brevo (domaine avec SPF/DKIM/DMARC)
  NOTIFY_EMAIL: string;         // boîte de VD qui reçoit les demandes
  NEWSLETTER_LIST_ID?: string;  // liste Cyber Signal
  DOI_TEMPLATE_ID?: string;     // modèle de double opt-in
};

const API = 'https://api.brevo.com/v3';

async function call(env: BrevoEnv, path: string, body: unknown): Promise<boolean> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  // Pas de journalisation du corps (données personnelles) ni de la clé
  if (!res.ok) console.error(`brevo ${path} -> ${res.status}`);
  return res.ok;
}

export function sendText(env: BrevoEnv, to: string, subject: string, text: string, replyTo?: string) {
  return call(env, '/smtp/email', {
    sender: { name: 'VD', email: env.SENDER_EMAIL },
    to: [{ email: to }],
    subject: subject.slice(0, 150),
    textContent: text,
    ...(replyTo ? { replyTo: { email: replyTo } } : {}),
  });
}

// Double opt-in : le contact n'entre dans la liste qu'après clic de confirmation
export function newsletterDoubleOptIn(env: BrevoEnv, email: string, origin: string) {
  if (!env.NEWSLETTER_LIST_ID || !env.DOI_TEMPLATE_ID) return Promise.resolve(false);
  return call(env, '/contacts/doubleOptinConfirmation', {
    email,
    includeListIds: [Number(env.NEWSLETTER_LIST_ID)],
    templateId: Number(env.DOI_TEMPLATE_ID),
    redirectionUrl: `${origin}/merci`,
  });
}
