// Générateurs Schema.org. Un seul graphe @graph par page, identifiants stables (#person, #org, #website).
import { SITE } from './site';
import type { Article } from './blog';

const U = SITE.url;

export const person = {
  '@type': 'Person',
  '@id': `${U}/#person`,
  name: SITE.fullName,
  jobTitle: 'RSSI externalisé (vCISO) et expert en sécurité de l’IA',
  worksFor: { '@id': `${U}/#org` },
  knowsAbout: ['NIS2', 'DORA', 'AI Act', 'ISO/IEC 27001', 'ISO/IEC 42001', 'Sécurité des LLM', 'RAG', 'Model Context Protocol', 'Gouvernance, risques et conformité'],
  url: U,
  ...(SITE.linkedin ? { sameAs: [SITE.linkedin] } : {}),
};

export const org = {
  '@type': 'ProfessionalService',
  '@id': `${U}/#org`,
  name: SITE.legalName,
  url: U,
  email: SITE.email,
  founder: { '@id': `${U}/#person` },
  areaServed: SITE.areaServed.map((name) => ({ '@type': 'Place', name })),
  description: SITE.description,
  knowsLanguage: ['fr', 'en'],
  makesOffer: [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'vCISO · RSSI-as-a-Service', url: `${U}/services#vciso` } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Accompagnement Sécurité IA', url: `${U}/services#ia` } },
  ],
};

export const website = {
  '@type': 'WebSite',
  '@id': `${U}/#website`,
  url: U,
  name: 'VD, vCISO et sécurité de l’IA',
  inLanguage: 'fr-FR',
  publisher: { '@id': `${U}/#org` },
};

export const faqPage = (items: { q: string; a: string }[], path: string) => ({
  '@type': 'FAQPage',
  '@id': `${U}${path}#faq`,
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
});

export const breadcrumb = (trail: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${U}${t.path}` })),
});

export const blogPosting = (a: Article) => ({
  '@type': 'BlogPosting',
  '@id': `${U}/blog/${a.slug}#article`,
  headline: a.title,
  description: a.excerpt,
  datePublished: a.publishedAt,
  dateModified: a.updatedAt ?? a.publishedAt,
  inLanguage: 'fr-FR',
  author: { '@id': `${U}/#person` },
  publisher: { '@id': `${U}/#org` },
  mainEntityOfPage: `${U}/blog/${a.slug}`,
  articleSection: a.category,
  timeRequired: `PT${a.readingMinutes}M`,
  citation: a.sources.map((s) => s.url),
});

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
