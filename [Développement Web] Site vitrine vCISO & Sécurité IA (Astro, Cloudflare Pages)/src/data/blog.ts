// Source unique du contenu éditorial. Consommée par /blog, /blog/[slug], sitemap et /mcp (plus tard).
// Règle : tout chiffre ou date réglementaire doit être rattaché à une entrée de `sources`.
// publishedAt : À AJUSTER au jour réel de mise en ligne.

export type Block =
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'quote'; text: string };

export type Article = {
  slug: string;
  kind: 'pilier' | 'satellite';
  category: 'Gouvernance' | 'Sécurité IA' | 'Conformité' | 'Crise' | 'Investissement';
  title: string;
  excerpt: string;
  publishedAt: string; // ISO 8601
  updatedAt?: string;
  readingMinutes: number;
  body: Block[];
  faq: { q: string; a: string }[];
  cta: { title: string; text: string; href: string; label: string };
  leadMagnetSlug: string;
  sources: { label: string; url: string }[];
};

const RAW: Omit<Article, 'readingMinutes'>[] = [
  {
    slug: 'vciso-vs-rssi-interne',
    kind: 'pilier',
    category: 'Gouvernance',
    title: 'vCISO ou RSSI interne : comment choisir selon votre taille et vos obligations',
    excerpt:
      "Coût, délai de démarrage, continuité, indépendance : les critères concrets pour décider entre un RSSI salarié et un RSSI à temps partagé.",
    publishedAt: '2026-09-21',
    body: [
      { t: 'p', text: "La question n'est pas de savoir si votre entreprise a besoin d'un responsable de la sécurité. NIS2, DORA, les questionnaires de vos clients et les audits de vos investisseurs l'exigent déjà. La question porte sur la forme : un poste salarié à temps plein, ou un RSSI externalisé qui intervient quelques jours par mois." },
      { t: 'h2', text: 'Ce que fait réellement un RSSI' },
      { t: 'p', text: "Dans une PME ou une ETI, le rôle couvre quatre activités : piloter les risques, tenir la conformité, préparer la crise et rendre compte à la direction. L'exécution technique (déploiement d'outils, administration, supervision) relève en général de la DSI ou d'un prestataire d'infogérance." },
      { t: 'ul', items: [
        'Pilotage des risques : cartographie, registre, arbitrages budgétaires.',
        'Conformité : politique de sécurité (PSSI), exigences NIS2, DORA, ISO 27001, preuves pour les audits.',
        "Crise : procédure d'incident, exercices, chaîne de notification aux autorités.",
        'Reporting : une lecture des risques compréhensible par un COMEX ou un conseil.',
      ] },
      { t: 'h2', text: 'Les critères de décision' },
      { t: 'h3', text: 'Le volume de travail réel' },
      { t: 'p', text: "Une entreprise de 150 salariés sans activité régulée n'occupe pas un RSSI cinq jours par semaine sur le pilotage. Un RSSI à plein temps y finit souvent absorbé par de l'opérationnel. À l'inverse, un groupe multi-sites soumis à DORA ou à NIS2 comme entité essentielle justifie en général une équipe interne." },
      { t: 'h3', text: 'Le coût complet' },
      { t: 'p', text: "Le coût d'un RSSI salarié ne se limite pas au salaire : charges, recrutement, formation, outillage et remplacement pendant les absences s'y ajoutent. Les baromètres de rémunération publiés en 2026 placent un RSSI expérimenté au-delà de 100 000 € brut annuels dans de nombreuses organisations. Un vCISO se facture au temps consommé, sans coût de recrutement." },
      { t: 'h3', text: 'Le délai' },
      { t: 'p', text: "Le marché de l'emploi cyber reste tendu : l'Observatoire des métiers de l'ANSSI relève une hausse de 49 % des offres d'emploi en cybersécurité entre 2019 et 2024. Un recrutement de RSSI prend plusieurs mois. Un vCISO démarre en 2 à 4 semaines, ce qui compte quand une échéance d'audit ou de levée de fonds est fixée." },
      { t: 'h3', text: "L'indépendance" },
      { t: 'p', text: "Un intervenant externe rend compte directement à la direction et n'a pas de périmètre technique à défendre. C'est un avantage pour arbitrer entre DSI, métiers et prestataires. La limite : il connaît moins l'histoire de l'entreprise au démarrage, d'où l'importance d'un cadrage initial sérieux." },
      { t: 'h2', text: 'Quand le vCISO n’est pas la bonne réponse' },
      { t: 'ul', items: [
        'Vous avez besoin d’une présence quotidienne sur site pour de la supervision opérationnelle.',
        'Votre volume de décisions sécurité justifie déjà une équipe de plusieurs personnes.',
        'Aucun interlocuteur interne ne peut porter les actions entre deux interventions.',
      ] },
      { t: 'p', text: "Dans ce dernier cas, un vCISO peut servir de transition : structurer la fonction, rédiger la fiche de poste et accompagner le recrutement d'un RSSI interne." },
      { t: 'quote', text: "Le bon modèle est celui qui produit des décisions et des preuves chaque trimestre, pas celui qui figure le mieux dans l'organigramme." },
    ],
    faq: [
      { q: 'Combien de jours par mois intervient un vCISO ?', a: "Le volume est fixé au cadrage selon la taille, le niveau de maturité et les échéances réglementaires. Il est ajustable chaque mois, sans engagement long terme." },
      { q: 'Un vCISO peut-il porter la responsabilité de la sécurité ?', a: "Il pilote et conseille, mais la responsabilité reste à la direction. NIS2 (art. 20) prévoit d'ailleurs que les organes de direction approuvent les mesures de gestion des risques et en supervisent la mise en œuvre." },
      { q: 'Le vCISO remplace-t-il la DSI ou l’infogérant ?', a: "Non. Il définit les exigences, priorise et contrôle. L'exécution technique reste à la DSI ou au prestataire." },
    ],
    cta: { title: 'Mesurez votre point de départ', text: '13 questions, 5 minutes, un score immédiat.', href: '/diagnostic', label: 'Faire le diagnostic' },
    leadMagnetSlug: 'modele-reporting-comex',
    sources: [
      { label: 'Directive (UE) 2022/2555 (NIS2), art. 20', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' },
      { label: 'ANSSI, Observatoire des métiers de la cybersécurité (édition 2025) — chiffre repris par la presse, source primaire à confirmer', url: 'https://cyber.gouv.fr' },
    ],
  },
  {
    slug: 'securite-llm-rag-production',
    kind: 'pilier',
    category: 'Sécurité IA',
    title: 'Sécuriser un LLM et un RAG en production : menaces réelles et garde-fous',
    excerpt:
      "Prompt injection, fuite de données, permissions excessives des agents : les risques qui comptent pour un assistant RAG ou un agent outillé, et les contrôles qui les réduisent.",
    publishedAt: '2026-09-21',
    body: [
      { t: 'p', text: "Un assistant fondé sur un LLM change la nature de la surface d'attaque : le texte devient une entrée exécutable. Un document indexé, un email ou la réponse d'un outil peut contenir des instructions que le modèle suivra. Les instructions système ne constituent donc pas une frontière de sécurité." },
      { t: 'h2', text: 'Les référentiels à utiliser' },
      { t: 'p', text: "Deux références structurent l'analyse. L'OWASP Top 10 for LLM Applications (édition 2025) liste les classes de vulnérabilités applicatives. MITRE ATLAS décrit les tactiques et techniques d'attaque observées contre les systèmes d'IA, sur le modèle d'ATT&CK." },
      { t: 'ul', items: [
        'LLM01 Prompt Injection, directe ou indirecte.',
        'LLM02 Sensitive Information Disclosure.',
        'LLM03 Supply Chain : modèles, jeux de données, dépendances.',
        'LLM04 Data and Model Poisoning.',
        'LLM05 Improper Output Handling.',
        'LLM06 Excessive Agency.',
        'LLM07 System Prompt Leakage.',
        'LLM08 Vector and Embedding Weaknesses.',
        'LLM09 Misinformation.',
        'LLM10 Unbounded Consumption.',
      ] },
      { t: 'h2', text: 'Les risques spécifiques au RAG' },
      { t: 'h3', text: 'Contrôle d’accès au moment de la recherche' },
      { t: 'p', text: "Le défaut le plus fréquent : l'index vectoriel contient des documents que l'utilisateur n'a pas le droit de lire. Le modèle les cite alors sans que personne ne l'ait voulu. Les droits d'accès doivent être appliqués au moment de la récupération, avec l'identité de l'utilisateur final, pas celle du service." },
      { t: 'h3', text: 'Empoisonnement du corpus' },
      { t: 'p', text: "Toute source que l'assistant indexe peut porter une injection indirecte : page wiki modifiable, pièce jointe, ticket client. Il faut tracer la provenance de chaque document, limiter les sources autorisées en écriture et tester l'assistant avec des documents piégés." },
      { t: 'h2', text: 'Les risques spécifiques aux agents et au MCP' },
      { t: 'p', text: "Un agent qui appelle des outils via le Model Context Protocol ajoute un risque d'action : envoyer, modifier, supprimer. La gravité d'une injection réussie dépend directement des permissions de l'agent." },
      { t: 'ul', items: [
        'Descriptions d’outils et réponses de serveurs MCP traitées comme des données non fiables.',
        'Serveurs MCP issus de sources vérifiées, versions épinglées.',
        'Jetons d’accès au périmètre minimal, par outil, révocables.',
        'Confirmation humaine avant toute action irréversible ou externe.',
        'Validation des arguments d’outils par du code, indépendamment du modèle.',
      ] },
      { t: 'h2', text: 'Les garde-fous qui tiennent' },
      { t: 'ol', items: [
        "Séparer ce qui est de confiance (instructions de l'application) de ce qui ne l'est pas (documents, emails, résultats d'outils).",
        'Ne jamais exécuter ni interpréter la sortie du modèle sans validation : pas de HTML brut, pas de requête SQL, pas de commande shell.',
        'Appliquer le moindre privilège aux données et aux outils, refus par défaut.',
        'Journaliser les appels d’outils et les décisions, sans journaliser les secrets.',
        'Limiter la consommation : quotas, taille de contexte, nombre d’appels par session.',
        'Tester en continu avec des scénarios adverses et documenter le risque résiduel.',
      ] },
      { t: 'quote', text: "Considérez qu'une injection finira par réussir. Le travail de sécurité consiste à en borner les conséquences." },
    ],
    faq: [
      { q: 'Un filtre anti-prompt-injection suffit-il ?', a: "Non. Les filtres réduisent le volume d'attaques mais peuvent être contournés. Ils complètent le moindre privilège, la validation des sorties et la confirmation humaine, sans les remplacer." },
      { q: 'Faut-il héberger le modèle soi-même ?', a: "Pas nécessairement. La décision dépend de la sensibilité des données, des engagements contractuels du fournisseur sur la conservation et l'entraînement, et de la localisation du traitement. L'hébergement interne déplace le risque sans le supprimer." },
      { q: 'Quelle différence entre OWASP Top 10 LLM et MITRE ATLAS ?', a: "L'OWASP classe des vulnérabilités applicatives pour guider la conception. ATLAS décrit le comportement des attaquants pour guider le threat modeling et la détection. Les deux se complètent." },
    ],
    cta: { title: 'Un assistant ou un agent à sécuriser ?', text: 'Mission cadrée de 30 à 90 jours, périmètre fixé avant signature.', href: '/services#ia', label: "Voir l'accompagnement Sécurité IA" },
    leadMagnetSlug: 'grille-threat-model-llm',
    sources: [
      { label: 'OWASP Top 10 for LLM Applications 2025', url: 'https://genai.owasp.org/llm-top-10/' },
      { label: 'MITRE ATLAS', url: 'https://atlas.mitre.org' },
    ],
  },
  {
    slug: 'guide-nis2-pme',
    kind: 'pilier',
    category: 'Conformité',
    title: 'NIS2 pour les PME et ETI : périmètre, obligations et plan de préparation',
    excerpt:
      "Êtes-vous concerné, que demande la directive, où en est la transposition française et par quoi commencer sans attendre les décrets.",
    publishedAt: '2026-09-21',
    body: [
      { t: 'p', text: "La directive (UE) 2022/2555, dite NIS2, élargit fortement le nombre d'organisations soumises à des obligations de cybersécurité. En France, elle est transposée par le projet de loi relatif à la résilience des infrastructures critiques et au renforcement de la cybersécurité, qui couvre aussi la directive REC et une partie de DORA." },
      { t: 'h2', text: 'État de la transposition en France' },
      { t: 'p', text: "Le Sénat a adopté le texte en première lecture le 12 mars 2025. Au début du mois d'août 2026, la loi n'était pas encore promulguée d'après les sources consultées. Vérifiez l'état du texte sur Légifrance avant toute décision : les délais de mise en conformité courront à partir de la loi et de ses décrets d'application." },
      { t: 'p', text: "Attendre la promulgation est un mauvais calcul. Vos clients soumis à NIS2 doivent sécuriser leur chaîne d'approvisionnement (art. 21) et répercutent déjà ces exigences dans leurs contrats et questionnaires." },
      { t: 'h2', text: 'Êtes-vous concerné ?' },
      { t: 'p', text: "Deux conditions cumulatives, sous réserve des adaptations nationales : exercer dans l'un des 18 secteurs listés aux annexes I et II de la directive, et atteindre au moins la taille d'une moyenne entreprise (50 salariés, ou plus de 10 M€ de chiffre d'affaires et de bilan). Certaines entités sont visées quelle que soit leur taille." },
      { t: 'ul', items: [
        'Entités essentielles : secteurs hautement critiques et grandes entreprises. Contrôle a priori.',
        'Entités importantes : autres cas. Contrôle a posteriori, après un incident ou un signalement.',
        "Amendes maximales prévues par la directive : 10 M€ ou 2 % du CA mondial pour les essentielles, 7 M€ ou 1,4 % pour les importantes.",
      ] },
      { t: 'h2', text: 'Ce que la directive exige' },
      { t: 'h3', text: 'La direction est responsable (art. 20)' },
      { t: 'p', text: "Les organes de direction approuvent les mesures de gestion des risques, supervisent leur mise en œuvre et suivent une formation. La sécurité ne peut plus être entièrement déléguée à la DSI." },
      { t: 'h3', text: 'Les mesures de gestion des risques (art. 21)' },
      { t: 'ul', items: [
        'Politiques d’analyse des risques et de sécurité des systèmes d’information.',
        'Gestion des incidents.',
        'Continuité d’activité : sauvegardes, reprise, gestion de crise.',
        'Sécurité de la chaîne d’approvisionnement.',
        'Sécurité de l’acquisition, du développement et de la maintenance, dont la gestion des vulnérabilités.',
        'Évaluation de l’efficacité des mesures.',
        'Cyberhygiène et formation.',
        'Cryptographie et chiffrement.',
        'Sécurité des ressources humaines, contrôle d’accès et gestion des actifs.',
        'Authentification multifacteur et communications sécurisées.',
      ] },
      { t: 'h3', text: 'La notification des incidents importants (art. 23)' },
      { t: 'ol', items: [
        'Alerte précoce dans les 24 heures après la prise de connaissance.',
        "Notification d'incident dans les 72 heures, avec une première évaluation.",
        'Rapport final au plus tard un mois après la notification.',
      ] },
      { t: 'h2', text: 'Plan de préparation en quatre temps' },
      { t: 'ol', items: [
        'Qualifier votre statut : secteur, taille, entité essentielle ou importante.',
        'Mesurer l’écart avec les dix mesures de l’article 21 et prioriser selon le risque.',
        'Écrire et tester la procédure de notification 24 h / 72 h / 1 mois.',
        'Former la direction et formaliser ses décisions : c’est la première preuve demandée en cas de contrôle.',
      ] },
      { t: 'p', text: "L'ANSSI, désignée autorité nationale compétente, publie ses ressources et son parcours d'identification des entités sur cyber.gouv.fr." },
    ],
    faq: [
      { q: 'Mon entreprise de 60 salariés est-elle concernée ?', a: "Si elle exerce dans l'un des 18 secteurs des annexes de la directive, probablement. La taille seule ne suffit pas : c'est le croisement secteur et taille qui compte. Le parcours d'identification de l'ANSSI permet de vérifier." },
      { q: 'Quelle est la date limite de mise en conformité ?', a: "Elle dépendra de la loi française et de ses décrets. À la date de rédaction, la loi n'était pas promulguée selon les sources consultées. Consultez Légifrance et cyber.gouv.fr pour l'état à jour." },
      { q: 'ISO 27001 suffit-il pour NIS2 ?', a: "Une certification ISO 27001 couvre une grande partie des mesures de l'article 21, mais pas la notification aux autorités ni la responsabilité formelle de la direction. Un écart reste à traiter." },
    ],
    cta: { title: 'Checklist NIS2 pour PME', text: 'Les dix mesures de l’article 21 traduites en actions vérifiables.', href: '/ressources/checklist-nis2-pme', label: 'Télécharger la checklist' },
    leadMagnetSlug: 'checklist-nis2-pme',
    sources: [
      { label: 'Directive (UE) 2022/2555 (NIS2)', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' },
      { label: 'Légifrance, état des textes', url: 'https://www.legifrance.gouv.fr' },
      { label: 'ANSSI, cyber.gouv.fr', url: 'https://cyber.gouv.fr' },
    ],
  },
  {
    slug: 'matrice-ai-act-2026',
    kind: 'satellite',
    category: 'Sécurité IA',
    title: 'AI Act : la matrice de classification et le calendrier mis à jour en 2026',
    excerpt:
      "Pratiques interdites, haut risque, transparence : comment classer vos systèmes d'IA, et ce que le Digital Omnibus a changé dans les échéances.",
    publishedAt: '2026-09-21',
    body: [
      { t: 'p', text: "Le règlement (UE) 2024/1689 sur l'intelligence artificielle classe les systèmes selon leur usage, pas selon la technologie. Le même modèle de langage peut être à risque minimal dans un outil de rédaction interne et à haut risque dans un outil de tri de candidatures." },
      { t: 'h2', text: 'Les quatre niveaux' },
      { t: 'ul', items: [
        'Pratiques interdites (art. 5) : notation sociale, manipulation exploitant des vulnérabilités, reconnaissance des émotions au travail et dans l’enseignement, sauf exceptions prévues.',
        'Haut risque (art. 6 et annexe III) : recrutement et gestion des salariés, accès au crédit et aux services essentiels, éducation, infrastructures critiques, biométrie, entre autres.',
        'Obligations de transparence (art. 50) : informer qu’on interagit avec une IA, signaler les contenus générés ou manipulés.',
        'Risque minimal : pas d’obligation spécifique au-delà des règles générales.',
      ] },
      { t: 'h2', text: 'Le calendrier après le Digital Omnibus' },
      { t: 'p', text: "Le Digital Omnibus sur l'IA a repoussé les obligations applicables aux systèmes à haut risque. D'après les analyses juridiques publiées à l'été 2026, le texte a été publié au Journal officiel de l'UE le 24 juillet 2026. Vérifiez la version consolidée sur EUR-Lex avant de fixer vos échéances." },
      { t: 'ol', items: [
        '2 février 2025 : pratiques interdites.',
        '2 août 2025 : obligations des fournisseurs de modèles d’IA à usage général.',
        '2 août 2026 : obligations de transparence de l’article 50, avec un délai au 2 décembre 2026 pour certains systèmes déjà sur le marché.',
        '2 décembre 2027 : systèmes à haut risque autonomes (annexe III).',
        '2 août 2028 : IA intégrée dans des produits réglementés (annexe I).',
      ] },
      { t: 'h2', text: 'Méthode de classification en trois passes' },
      { t: 'ol', items: [
        "Inventorier : chaque système d'IA développé, acheté ou intégré, avec son usage réel et ses utilisateurs.",
        "Qualifier : croiser l'usage avec l'article 5, l'annexe III et l'article 50. Noter votre rôle : fournisseur ou déployeur.",
        'Documenter : la justification de chaque classement, datée et signée. Elle sera demandée en premier.',
      ] },
      { t: 'p', text: "Le report des échéances ne réduit pas le travail d'inventaire. C'est l'étape la plus longue, et elle ne dépend pas des normes harmonisées encore en préparation." },
    ],
    faq: [
      { q: 'Un chatbot client est-il à haut risque ?', a: "En général non : il relève des obligations de transparence de l'article 50. Il bascule en haut risque s'il sert à une décision listée à l'annexe III, par exemple l'éligibilité à un service essentiel." },
      { q: 'Déployeur ou fournisseur, quelle différence ?', a: "Le fournisseur développe ou met sur le marché le système. Le déployeur l'utilise sous sa propre autorité. Les obligations diffèrent : le déployeur d'un système à haut risque doit notamment en assurer la supervision humaine et l'utiliser conformément aux instructions." },
      { q: 'ISO 42001 est-elle obligatoire ?', a: "Non. C'est une norme volontaire de système de management de l'IA. Elle fournit un cadre utile pour organiser la gouvernance exigée par l'AI Act, sans valoir présomption de conformité à elle seule." },
    ],
    cta: { title: 'Matrice de classification AI Act', text: 'Un tableau prêt à remplir pour votre inventaire.', href: '/ressources/matrice-ai-act', label: 'Télécharger la matrice' },
    leadMagnetSlug: 'matrice-ai-act',
    sources: [
      { label: 'Règlement (UE) 2024/1689 (AI Act)', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' },
      { label: 'Digital Omnibus sur l’IA : référence au JOUE à vérifier sur EUR-Lex', url: 'https://eur-lex.europa.eu' },
      { label: 'ISO/IEC 42001:2023', url: 'https://www.iso.org/standard/81230.html' },
    ],
  },
  {
    slug: 'kit-incident-cyber-24h',
    kind: 'satellite',
    category: 'Crise',
    title: 'Incident cyber : les 24 premières heures, heure par heure',
    excerpt:
      "Isoler sans détruire les preuves, décider, notifier : la séquence à suivre et les contacts à avoir sous la main avant l'incident.",
    publishedAt: '2026-09-21',
    body: [
      { t: 'p', text: "Les décisions prises dans les premières heures déterminent le coût final d'un incident. Elles se préparent à froid : une procédure d'une page, des contacts vérifiés, des rôles attribués." },
      { t: 'h2', text: 'La séquence' },
      { t: 'ol', items: [
        "Détecter et qualifier : noter l'heure de prise de connaissance. Elle fait courir les délais de notification.",
        "Isoler : déconnecter du réseau les machines touchées sans les éteindre, pour préserver les traces en mémoire.",
        "Mobiliser la cellule de crise : un décideur, un responsable technique, un responsable communication, un secrétaire qui tient la main courante.",
        "Évaluer : périmètre touché, données concernées, continuité d'activité.",
        "Notifier : autorités, assureur, clients si nécessaire, dans les délais applicables.",
        "Communiquer : un message interne factuel, puis externe si l'incident est visible.",
      ] },
      { t: 'h2', text: 'Les délais réglementaires' },
      { t: 'ul', items: [
        'Violation de données personnelles : notification à la CNIL dans les 72 heures, sauf risque improbable pour les personnes (RGPD, art. 33).',
        'Entité soumise à NIS2 : alerte précoce sous 24 heures, notification sous 72 heures, rapport final sous un mois (art. 23), selon les modalités de la transposition française.',
        'Assureur : délai fixé par votre contrat. Vérifiez-le avant l’incident.',
      ] },
      { t: 'h2', text: 'Les contacts à préparer' },
      { t: 'ul', items: [
        '17Cyber, le dispositif d’assistance de Cybermalveillance.gouv.fr.',
        'Le CSIRT de votre région.',
        'L’ANSSI (CERT-FR) si vous êtes une entité régulée.',
        'La CNIL pour les violations de données personnelles.',
        'Votre assureur et votre prestataire de réponse à incident.',
        'Le commissariat ou la gendarmerie pour le dépôt de plainte.',
      ] },
      { t: 'h2', text: 'Les erreurs fréquentes' },
      { t: 'ul', items: [
        'Éteindre les machines et perdre les preuves volatiles.',
        'Restaurer avant d’avoir compris le point d’entrée, et se faire réinfecter.',
        'Communiquer sur le périmètre avant de le connaître.',
        'Négocier seul avec un attaquant. Les autorités recommandent de ne pas payer de rançon.',
      ] },
    ],
    faq: [
      { q: 'Faut-il porter plainte ?', a: "Oui, c'est recommandé. La plainte est souvent exigée par l'assureur et permet aux autorités de rapprocher des affaires." },
      { q: 'Quand déclenche-t-on le délai de 72 heures RGPD ?', a: "À partir du moment où le responsable du traitement a connaissance de la violation. D'où l'importance de noter l'heure dès la détection." },
      { q: 'Peut-on notifier sans connaître tout le périmètre ?', a: "Oui. Le RGPD comme NIS2 prévoient une notification initiale complétée ensuite. Mieux vaut notifier dans les délais avec des informations partielles." },
    ],
    cta: { title: 'Playbook incident 24 h', text: 'Procédure d’une page, fiches rôles et modèle de main courante.', href: '/ressources/playbook-incident-24h', label: 'Télécharger le playbook' },
    leadMagnetSlug: 'playbook-incident-24h',
    sources: [
      { label: 'Règlement (UE) 2016/679 (RGPD), art. 33', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
      { label: 'Directive (UE) 2022/2555 (NIS2), art. 23', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' },
      { label: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr' },
      { label: 'CNIL', url: 'https://www.cnil.fr' },
    ],
  },
  {
    slug: 'checklist-due-diligence-cyber-levee-de-fonds',
    kind: 'satellite',
    category: 'Investissement',
    title: 'Due diligence cyber avant une levée de fonds : ce que les investisseurs vérifient',
    excerpt:
      "Gouvernance, accès, sauvegardes, historique d'incidents, IA : les points contrôlés et les preuves à préparer avant l'ouverture de la data room.",
    publishedAt: '2026-09-21',
    body: [
      { t: 'p', text: "Une due diligence cyber ne cherche pas une entreprise sans risque. Elle cherche une entreprise qui connaît ses risques, les pilote et peut le prouver avec des documents datés." },
      { t: 'h2', text: 'Les points contrôlés' },
      { t: 'h3', text: 'Gouvernance' },
      { t: 'ul', items: [
        'Qui porte la sécurité, avec quel mandat et quel temps alloué.',
        'PSSI validée par la direction, comptes rendus de comité.',
        'Registre des risques à jour, avec propriétaires et échéances.',
      ] },
      { t: 'h3', text: 'Contrôles techniques' },
      { t: 'ul', items: [
        'MFA sur la messagerie, le cloud et les accès administrateur.',
        'Sauvegardes hors ligne et dernier test de restauration.',
        'Gestion des vulnérabilités et dernier test d’intrusion, avec suivi des corrections.',
        'Configuration des environnements cloud et gestion des secrets.',
      ] },
      { t: 'h3', text: 'Données et tiers' },
      { t: 'ul', items: [
        'Registre des traitements RGPD et contrats de sous-traitance.',
        'Liste des prestataires critiques et leurs engagements de sécurité.',
        'Usages de l’IA : quels outils, quelles données envoyées, quelles garanties contractuelles.',
      ] },
      { t: 'h3', text: 'Historique' },
      { t: 'ul', items: [
        'Incidents des trois dernières années et actions correctives.',
        'Couverture d’assurance cyber et exclusions.',
        'Certifications ou attestations : ISO 27001, SOC 2, avec leur périmètre exact.',
      ] },
      { t: 'h2', text: 'Préparer en six semaines' },
      { t: 'ol', items: [
        'Rassembler les preuves existantes et identifier les trous.',
        'Traiter les écarts visibles en priorité : MFA, sauvegardes, comptes orphelins.',
        'Rédiger une note de synthèse de deux pages sur la posture et la feuille de route.',
        'Préparer les réponses aux questions probables avec des références aux documents.',
      ] },
      { t: 'quote', text: "Un écart documenté avec un plan daté inquiète moins un investisseur qu'une absence de réponse." },
    ],
    faq: [
      { q: 'Une certification ISO 27001 est-elle attendue ?', a: "Pas systématiquement pour une levée en phase précoce. Elle devient un atout net face à des clients grands comptes et en phase de croissance. Vérifiez toujours son périmètre : il peut exclure une partie du SI." },
      { q: 'Faut-il déclarer les incidents passés ?', a: "Oui. Un incident découvert pendant la due diligence et non déclaré pèse bien plus lourd qu'un incident présenté avec ses actions correctives." },
      { q: 'Combien de temps prévoir ?', a: "Selon la maturité de départ, de quelques semaines à plusieurs mois. Commencez avant l'ouverture de la data room." },
    ],
    cta: { title: 'Checklist due diligence cyber', text: 'Les preuves à réunir, classées par thème.', href: '/ressources/checklist-due-diligence-cyber', label: 'Télécharger la checklist' },
    leadMagnetSlug: 'checklist-due-diligence-cyber',
    sources: [
      { label: 'Règlement (UE) 2016/679 (RGPD), art. 30', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
    ],
  },
];

// Temps de lecture calculé (≈ 200 mots/min) plutôt que déclaré : pas de chiffre inventé.
const words = (a: Omit<Article, 'readingMinutes'>) =>
  a.body.map((b) => ('text' in b ? b.text : b.items.join(' '))).join(' ').split(/\s+/).length;

export const ARTICLES: Article[] = RAW.map((a) => ({ ...a, readingMinutes: Math.max(1, Math.ceil(words(a) / 200)) }))
  .sort((x, y) => y.publishedAt.localeCompare(x.publishedAt));

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
