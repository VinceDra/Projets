// Questions adaptées du guide ANSSI/DGE « La cybersécurité pour les TPE/PME en 13 questions »
// (2e édition, octobre 2022). Libellés reformulés : ne pas les présenter comme le texte officiel.
// À CONFIRMER : correspondance exacte des questions 11 à 13 avec l'édition en vigueur.

export type DiagQuestion = {
  id: string;
  theme: string;
  question: string;
  hint: string;
  vigilance: string; // affiché si réponse Non ou Partiel
};

export const DIAG_QUESTIONS: DiagQuestion[] = [
  { id: 'q1', theme: 'Inventaire', question: 'Connaissez-vous votre parc informatique et vos actifs métier ?', hint: 'Postes, serveurs, comptes cloud, applications, données critiques, prestataires.', vigilance: "Inventaire incomplet : impossible de protéger ce qui n'est pas recensé." },
  { id: 'q2', theme: 'Sauvegardes', question: 'Vos sauvegardes sont-elles régulières, hors ligne et testées ?', hint: 'Au moins une copie déconnectée, restauration testée dans l’année.', vigilance: 'Sauvegardes non éprouvées : risque de perte définitive en cas de rançongiciel.' },
  { id: 'q3', theme: 'Mises à jour', question: 'Les correctifs de sécurité sont-ils appliqués rapidement ?', hint: 'Systèmes, logiciels métier, équipements réseau, navigateurs.', vigilance: 'Correctifs en retard : premier vecteur d’intrusion exploité par les attaquants.' },
  { id: 'q4', theme: 'Antivirus / EDR', question: 'Un antivirus ou un EDR est-il actif sur tous les postes et serveurs ?', hint: 'Couverture complète, alertes suivies par quelqu’un.', vigilance: 'Protection des terminaux incomplète ou non supervisée.' },
  { id: 'q5', theme: 'Mots de passe et MFA', question: 'Imposez-vous des mots de passe robustes et la double authentification ?', hint: 'MFA sur messagerie, VPN, accès administrateur et cloud.', vigilance: 'Absence de MFA : un mot de passe volé suffit pour entrer.' },
  { id: 'q6', theme: 'Pare-feu', question: 'Un pare-feu est-il actif et ses règles de filtrage connues ?', hint: 'Règles documentées, revues, flux inutiles fermés.', vigilance: 'Filtrage réseau non maîtrisé : exposition de services inutiles.' },
  { id: 'q7', theme: 'Messagerie', question: 'Votre messagerie est-elle protégée contre l’hameçonnage ?', hint: 'Filtrage anti-phishing, SPF, DKIM et DMARC configurés.', vigilance: 'Messagerie exposée : usurpation de domaine et hameçonnage facilités.' },
  { id: 'q8', theme: 'Séparation des usages', question: 'Les comptes administrateur et les usages personnels sont-ils séparés ?', hint: 'Pas de navigation ni de messagerie avec un compte admin.', vigilance: 'Usages mélangés : une compromission de poste devient une compromission du SI.' },
  { id: 'q9', theme: 'Mobilité', question: 'Le télétravail et les déplacements sont-ils sécurisés ?', hint: 'VPN, chiffrement des disques, verrouillage des appareils.', vigilance: 'Mobilité non encadrée : perte ou vol d’appareil = fuite de données.' },
  { id: 'q10', theme: 'Sensibilisation', question: 'Vos collaborateurs sont-ils sensibilisés régulièrement ?', hint: 'Par exemple avec les contenus de Cybermalveillance.gouv.fr.', vigilance: 'Sensibilisation insuffisante : l’erreur humaine reste le point d’entrée principal.' },
  { id: 'q11', theme: 'Assurance', question: 'Avez-vous évalué une couverture d’assurance au risque cyber ?', hint: 'Garanties, exclusions, exigences de l’assureur.', vigilance: 'Couverture cyber non évaluée : coût d’un incident entièrement à votre charge.' },
  { id: 'q12', theme: 'Réaction', question: 'Savez-vous qui appeler et quoi faire en cas de cyberattaque ?', hint: 'Procédure écrite, contacts : 17Cyber, CSIRT régional, CNIL, assureur.', vigilance: 'Pas de procédure de crise : décisions improvisées dans les premières heures.' },
  { id: 'q13', theme: 'Cloud et données', question: 'Maîtrisez-vous vos usages cloud et la localisation de vos données ?', hint: 'Liste des services, contrats, pays d’hébergement, accès administrateur.', vigilance: 'Usages cloud non maîtrisés : données hors contrôle et exigences RGPD exposées.' },
];

export const DIAG_SCORES = { yes: 2, partial: 1, no: 0 } as const;
export const DIAG_LEVELS = [
  { min: 75, label: 'Mature' },
  { min: 50, label: 'Intermédiaire' },
  { min: 0, label: 'À renforcer' },
] as const;
