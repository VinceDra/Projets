// 6 livrables. Sources PDF : private-assets/pdf (généré par private-assets/src/build.py).
// Jamais dans public/ : servis par lien signé après le formulaire (voir functions/api).

export type Resource = {
  slug: string;
  type: 'Checklist' | 'Matrice' | 'Playbook' | 'Modèle' | 'Grille';
  title: string;
  description: string;
  benefits: string[];
  contents: string[];
  format: string;
  relatedArticle?: string;
};

export const RESOURCES: Resource[] = [
  {
    slug: 'checklist-nis2-pme',
    type: 'Checklist',
    title: 'Checklist NIS2 pour PME et ETI',
    description: "Les dix mesures de l'article 21 de NIS2 traduites en contrôles vérifiables, avec la preuve attendue pour chacun.",
    benefits: [
      'Mesurer votre écart en une demi-journée.',
      'Prioriser selon le risque plutôt que selon l’ordre du texte.',
      'Disposer d’une trame réutilisable pour le suivi trimestriel.',
    ],
    contents: ['Qualification entité essentielle ou importante', 'Contrôles par mesure de l’article 21', 'Preuves attendues', 'Procédure de notification 24 h / 72 h / 1 mois'],
    format: 'PDF, 2 pages',
    relatedArticle: 'guide-nis2-pme',
  },
  {
    slug: 'matrice-ai-act',
    type: 'Matrice',
    title: 'Matrice de classification AI Act',
    description: "Un tableau d'inventaire et de qualification de vos systèmes d'IA selon le règlement (UE) 2024/1689.",
    benefits: [
      'Recenser chaque système avec son usage réel.',
      'Distinguer votre rôle : fournisseur ou déployeur.',
      'Documenter la justification de chaque classement.',
    ],
    contents: ['Grille d’inventaire', 'Arbre de décision art. 5, annexe III, art. 50', 'Obligations par niveau', 'Calendrier des échéances'],
    format: 'PDF, 2 pages',
    relatedArticle: 'matrice-ai-act-2026',
  },
  {
    slug: 'playbook-incident-24h',
    type: 'Playbook',
    title: 'Playbook incident cyber 24 h',
    description: "La procédure d'une page à afficher, les fiches rôles de la cellule de crise et un modèle de main courante.",
    benefits: [
      'Savoir qui fait quoi dès la première heure.',
      'Respecter les délais RGPD et NIS2.',
      'Préserver les preuves pour l’assureur et l’enquête.',
    ],
    contents: ['Séquence heure par heure', 'Fiches rôles', 'Annuaire de crise à compléter', 'Modèle de main courante'],
    format: 'PDF, 3 pages',
    relatedArticle: 'kit-incident-cyber-24h',
  },
  {
    slug: 'checklist-due-diligence-cyber',
    type: 'Checklist',
    title: 'Checklist due diligence cyber',
    description: 'Les preuves que demandent investisseurs et acquéreurs, classées par thème, avec un statut à renseigner.',
    benefits: [
      'Préparer la data room avant la demande.',
      'Repérer les écarts visibles à corriger en priorité.',
      'Répondre avec des documents, pas des déclarations.',
    ],
    contents: ['Gouvernance', 'Contrôles techniques', 'Données et tiers', 'Historique et assurance'],
    format: 'PDF, 2 pages',
    relatedArticle: 'checklist-due-diligence-cyber-levee-de-fonds',
  },
  {
    slug: 'grille-threat-model-llm',
    type: 'Grille',
    title: 'Grille de threat modeling LLM, RAG et MCP',
    description: "Une grille d'analyse par composant (modèle, index, outils, sorties) alignée sur l'OWASP Top 10 for LLM Applications et MITRE ATLAS.",
    benefits: [
      'Structurer un atelier de threat modeling en deux heures.',
      'Relier chaque menace à un contrôle vérifiable.',
      'Documenter le risque résiduel accepté.',
    ],
    contents: ['Cartographie des flux de confiance', 'Menaces par composant', 'Contrôles recommandés', 'Scénarios de test adverses'],
    format: 'PDF, 2 pages',
    relatedArticle: 'securite-llm-rag-production',
  },
  {
    slug: 'modele-reporting-comex',
    type: 'Modèle',
    title: 'Modèle de reporting sécurité pour COMEX',
    description: 'Une page trimestrielle : les risques principaux, leur évolution, les décisions attendues de la direction et le budget.',
    benefits: [
      'Rendre compte en dix minutes de réunion.',
      'Obtenir des décisions plutôt que des constats.',
      'Tracer l’implication de la direction exigée par NIS2.',
    ],
    contents: ['Modèle une page', 'Exemple rempli', 'Indicateurs recommandés', 'Trame de compte rendu'],
    format: 'PDF, 2 pages',
    relatedArticle: 'vciso-vs-rssi-interne',
  },
];

export const getResource = (slug: string) => RESOURCES.find((r) => r.slug === slug);
