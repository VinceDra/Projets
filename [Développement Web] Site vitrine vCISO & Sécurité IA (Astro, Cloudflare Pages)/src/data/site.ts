// Source unique des informations d'identité et des offres.
// Les valeurs marquées À REMPLACER ne doivent pas partir en production telles quelles.

export const SITE = {
  name: 'VD',
  fullName: 'VD', // À REMPLACER : nom complet
  legalName: 'VD Conseil', // À REMPLACER : raison sociale exacte
  url: 'https://vd-cybersec.fr',
  email: 'contact@vd-cybersec.fr', // À REMPLACER : email de contact exact
  securityEmail: 'security@vd-cybersec.fr',
  linkedin: '', // À REMPLACER : URL LinkedIn (vide = masqué)
  areaServed: ['France', 'Union européenne'],
  tagline: 'Conseil indépendant · Cybersécurité, GRC & IA',
  description:
    "RSSI externalisé (vCISO) et accompagnement sécurité de l'IA pour PME, ETI et scale-ups européennes soumises à NIS2, DORA ou à l'AI Act.",
  experienceYears: '15+',
} as const;

export const NAV = [
  { href: '/services', label: 'Offres' },
  { href: '/diagnostic', label: 'Diagnostic' },
  { href: '/blog', label: 'Analyses' },
  { href: '/ressources', label: 'Ressources' },
  { href: '/newsletter', label: 'Newsletter' },
] as const;

export type Offer = {
  id: 'vciso' | 'ia';
  name: string;
  format: string;
  summary: string;
  forWho: string;
  deliverables: { title: string; detail: string }[];
  rhythm: string;
  start: string;
};

// EXACTEMENT 2 offres. Ne pas en ajouter.
export const OFFERS: Offer[] = [
  {
    id: 'vciso',
    name: 'vCISO · RSSI-as-a-Service',
    format: 'Abonnement mensuel, temps partagé, sans engagement long terme',
    summary:
      'Un RSSI expérimenté qui pilote votre sécurité quelques jours par mois : gouvernance, conformité, gestion de crise et reporting à la direction.',
    forWho:
      "Entreprises de 50 à 5 000 salariés sans RSSI à temps plein, ou dont l'équipe sécurité a besoin d'un appui senior.",
    deliverables: [
      { title: 'Gouvernance sécurité', detail: 'PSSI, comité sécurité, registre et tableau de bord des risques.' },
      { title: 'Conformité réglementaire', detail: 'Feuille de route NIS2, DORA pour le secteur financier, ISO 27001.' },
      { title: 'Gestion de crise', detail: "Procédure d'incident et chaîne de notification, dont l'alerte précoce sous 24 h (art. 23 NIS2)." },
      { title: 'Due diligence', detail: 'Dossier de preuves pour investisseurs, acquéreurs et questionnaires grands comptes.' },
      { title: 'Reporting COMEX', detail: 'Une page par trimestre : risques, décisions attendues, budget. Sans jargon.' },
    ],
    rhythm: 'Volume de jours mensuel défini au cadrage, ajustable chaque mois.',
    start: 'Démarrage en 2 à 4 semaines.',
  },
  {
    id: 'ia',
    name: 'Accompagnement Sécurité IA',
    format: 'Mission cadrée de 30 à 90 jours',
    summary:
      "Sécuriser un système d'IA en production ou en projet : LLM, RAG, serveurs MCP, agents. Classification AI Act et gouvernance ISO 42001 incluses.",
    forWho: 'Équipes produit et DSI qui déploient ou intègrent des LLM, assistants RAG ou agents outillés.',
    deliverables: [
      { title: 'Classification AI Act', detail: 'Inventaire des systèmes IA et qualification : pratique interdite, haut risque, obligation de transparence, risque minimal.' },
      { title: 'Threat modeling LLM, RAG, MCP', detail: 'Analyse fondée sur MITRE ATLAS et l’OWASP Top 10 for LLM Applications : prompt injection, exfiltration, jailbreak, poisoning.' },
      { title: 'Garde-fous techniques', detail: 'Filtrage entrée et sortie, isolation des données sensibles, moindre privilège pour les outils des agents.' },
      { title: 'Gouvernance ISO 42001', detail: 'Politique IA, rôles, registre des risques IA, supervision humaine documentée.' },
    ],
    rhythm: 'Périmètre, livrables et critères de fin fixés avant signature.',
    start: 'Mission de 30 à 90 jours selon le périmètre.',
  },
];

// Faits affichés sur l'accueil. Chaque entrée doit rester vérifiable.
// Les métriques du brief initial (200+ projets, 90 % de risques maîtrisés, « M€ » de ROI)
// sont retirées tant qu'aucune source n'est fournie. À RÉINTÉGRER uniquement avec preuve.
export const FACTS = [
  { value: '15+ ans', label: "d'expérience en sécurité des systèmes d'information" },
  { value: '2 à 4 sem.', label: 'pour démarrer un accompagnement vCISO' },
  { value: '30 à 90 j', label: 'par mission Sécurité IA, périmètre fixé à la signature' },
  { value: '24 h', label: "pour l'alerte précoce d'un incident important sous NIS2 (art. 23)" },
];
