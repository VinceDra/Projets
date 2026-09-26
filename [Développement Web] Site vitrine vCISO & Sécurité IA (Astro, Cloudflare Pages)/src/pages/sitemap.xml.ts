// Sitemap généré au build, sans dépendance supplémentaire.
import type { APIRoute } from 'astro';
import { ARTICLES } from '../data/blog';
import { RESOURCES } from '../data/resources';
import { SITE } from '../data/site';

const staticPaths = ['/', '/services', '/diagnostic', '/blog', '/ressources', '/newsletter', '/contact', '/mentions-legales', '/confidentialite', '/politique-divulgation'];

export const GET: APIRoute = () => {
  const urls = [
    ...staticPaths.map((p) => ({ loc: `${SITE.url}${p === '/' ? '' : p}` })),
    ...ARTICLES.map((a) => ({ loc: `${SITE.url}/blog/${a.slug}`, lastmod: a.updatedAt ?? a.publishedAt })),
    ...RESOURCES.map((r) => ({ loc: `${SITE.url}/ressources/${r.slug}` })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc>${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
