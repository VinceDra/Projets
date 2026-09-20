// GET /telechargement?r=<slug>&e=<exp>&s=<sig> : sert un PDF depuis R2 si la signature est valide.
// Binding R2 : ASSETS (bucket privé contenant private-assets/pdf/*.pdf).
import { RESOURCES } from '../src/data/resources';
import { verifyDownload } from '../server/sign';

type R2Obj = { body: ReadableStream };
type Env = { DOWNLOAD_SECRET?: string; ASSETS?: { get(key: string): Promise<R2Obj | null> } };

const deny = (status: number, msg: string) =>
  new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const u = new URL(request.url);
  const r = u.searchParams.get('r') ?? '';
  const res = RESOURCES.find((x) => x.slug === r);
  if (!res || !env.DOWNLOAD_SECRET || !env.ASSETS) return deny(404, 'Lien invalide.');
  const valid = await verifyDownload(env.DOWNLOAD_SECRET, r, u.searchParams.get('e') ?? '', u.searchParams.get('s') ?? '');
  if (!valid) return deny(403, 'Lien expiré ou invalide. Redemandez le document depuis la page ressource.');
  const obj = await env.ASSETS.get(`${res.slug}.pdf`);
  if (!obj) return deny(404, 'Document indisponible.');
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${res.slug}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
      'Referrer-Policy': 'no-referrer',
    },
  });
};
