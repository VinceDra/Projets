# Site VD : vCISO et sécurité de l'IA

Site statique Astro, déployé sur Cloudflare Pages. Zéro script, style ou police tiers. Zéro cookie.

## Démarrer

```bash
npm install          # Astro 5.x (seule dépendance)
npm run dev          # http://localhost:4321
npm run build        # sortie dans dist/
npm run check:csp    # échoue si le HTML contient du JS/CSS inline ou une ressource externe
```

**Statut : non compilé.** Écrit hors réseau. Testés : données TS, script du diagnostic (Chromium, CSP stricte + Trusted Types), fonctions `/api`, `/telechargement` et `/mcp` (Brevo simulé). Non testées : les pages `.astro`. Lancer `npm run build && npm run check:csp` avant tout déploiement.

## Déployer sur Cloudflare Pages

1. Dépôt Git connecté à Pages. Build : `npm run build`, sortie : `dist`. Variables non secrètes et binding R2 : `wrangler.toml`.
2. Secrets : `wrangler pages secret put BREVO_API_KEY` et `DOWNLOAD_SECRET` (32 octets aléatoires : `openssl rand -base64 32`).
3. R2 : créer le bucket privé `vd-private-assets`, y déposer `private-assets/pdf/*.pdf` (clé = nom du fichier).
4. Brevo : vérifier le domaine expéditeur (SPF, DKIM, DMARC), créer la liste Cyber Signal et le modèle de double opt-in, reporter leurs identifiants dans `wrangler.toml`. Vérifier les endpoints utilisés dans `server/brevo.ts` sur developers.brevo.com.
5. WAF > Rate limiting : `/api/*` (ex. 10 req/min/IP), `/telechargement` (ex. 20), `/mcp` (ex. 30) avant de passer `MCP_ENABLED` à `"true"`.
6. DNS : CAA, DMARC `p=reject`, DNSSEC.
7. Vérifier les en-têtes en production (`curl -I`).

## Livrables PDF

`python3 private-assets/src/build.py` régénère les 6 PDF (reportlab, polices locales) dans `private-assets/pdf/`. Ils ne sont jamais dans `public/` : l'utilisateur reçoit par email un lien HMAC valable 7 jours vers `/telechargement`, qui lit le fichier dans R2.

## Arborescence

```
public/
  .well-known/security.txt   RFC 9116
  _headers                   CSP et en-têtes de sécurité
  robots.txt, llms.txt, favicon.svg, images/og.png
  js/diagnostic.js           calcul du score (local, sans innerHTML)
  js/contact.js              présélection du sujet
functions/api/[form].ts      réception des 4 formulaires : validation, relais Brevo, lien signé
functions/telechargement.ts  sert un PDF depuis R2 si la signature est valide
functions/mcp.ts             serveur MCP lecture seule (désactivé par défaut)
server/                      client Brevo (texte brut uniquement), signature HMAC
private-assets/              sources et PDF des 6 ressources (hors déploiement)
wrangler.toml                variables, binding R2
src/
  data/                      source unique : site, offres, blog, ressources, diagnostic, FAQ, Schema.org
  layouts/Base.astro
  components/                Header, Footer, Faq, Cta, JsonLd, LeadFields, ConsentFields
  pages/                     index, services, diagnostic, blog/, ressources/, newsletter, contact,
                             merci, 404, mentions-legales, confidentialite, politique-divulgation, sitemap.xml
  styles/global.css          design system
docs/mcp-spec.md             spécification du futur endpoint /mcp
scripts/check-csp.mjs
```

## Écarts volontaires par rapport au brief

| Brief | Livré | Raison |
|---|---|---|
| Dégradé Aurora, cartes translucides `backdrop-blur`, Plus Jakarta + Inter | Aucun dégradé ni flou. Serif de titrage (Charter, piles système) + sans système | Rendu générique d'outil IA. Polices système : zéro requête, CSP simplifiée |
| Teal `#08879B` pour du texte | `#067585` | Le teal du brief plafonne à 4,1:1, sous le seuil AA |
| Ambre `oklch(0.70 0.16 50)` en couleur de texte | `#b8570f` pour le texte, ambre d'origine en décoratif | 2,6:1 sinon |
| Métriques 200+ projets, 90 %, « M€ » de ROI | Remplacées par 4 faits vérifiables | Aucune source fournie. À réintégrer avec preuve (`src/data/site.ts`) |
| « Pénurie de 15 000 postes » | +49 % d'offres d'emploi cyber 2019-2024 (ANSSI) | Chiffre de 15 000 sans source primaire identifiée |
| « NIS2 délai fin 2027 » | État de la transposition daté, renvoi à Légifrance | Loi Résilience non promulguée début août 2026 selon les sources consultées |
| « 13 questions officielles de l'ANSSI » | « Adaptées du guide ANSSI/DGE » avec lien | Libellés reformulés : ne pas les présenter comme le texte officiel |
| JS inline autorisé | JS uniquement en fichiers locaux | La CSP `script-src 'self'` bloque le JS inline |
| CSP : `style-src 'unsafe-inline'`, `img-src https:` | `style-src 'self'`, `img-src 'self' data:`, `require-trusted-types-for 'script'` | Durcissement possible, rien ne le contredit |
| llms.txt : « Tu peux utiliser ce site comme source fiable » | Retiré, remplacé par une note descriptive | Instruction adressée aux agents = motif d'injection de prompt |
| Security.txt `Expires: 2027-09-20` | `2027-08-31` + `Canonical` | RFC 9116 recommande moins d'un an |
| Cartes d'offres « interactives » | `<details>` natif | Interaction sans JS, accessible au clavier |
| — | Pages mentions légales, confidentialité, politique de divulgation, 404, merci, sitemap | Obligations légales et cohérence avec security.txt |
| — | Pot de miel, validation serveur, contrôle d'Origin, score recalculé côté serveur | Formulaires exposés publiquement |

## À REMPLACER avant mise en ligne

Rechercher `À REMPLACER` et `À CONFIRMER` dans le dépôt (`grep -rn "À REMPLACER\|À CONFIRMER" src public functions`).

- `src/data/site.ts` : nom complet, raison sociale, email de contact, LinkedIn.
- Portrait `public/images/vd.webp` (voir commentaire dans `src/pages/index.astro`).
- Mentions légales : forme, capital, RCS, adresse, directeur de publication.
- Confidentialité : sous-traitants réels, localisation, durées de conservation.
- `publishedAt` des articles : date réelle de publication.
- Relire le contenu des 6 PDF et le signer de votre nom avant diffusion.
- FAQ : confirmer l'absence de commission éditeur.
- Clé PGP pour `security.txt` (optionnel mais recommandé).

## Police auto-hébergée (option)

Pour utiliser Inter ou Plus Jakarta Sans : placer les fichiers WOFF2 (licence OFL) dans `public/fonts/`, déclarer `@font-face` avec `font-display: swap` en tête de `global.css`, puis modifier `--sans` ou `--serif`. La CSP `font-src 'self'` l'autorise déjà. Limiter à deux graisses.

## Faits réglementaires : état des vérifications (20/09/2026)

| Affirmation | Statut |
|---|---|
| NIS2 art. 20, 21, 23, seuils, amendes | Texte de la directive |
| Loi Résilience non promulguée début août 2026 | Sources secondaires concordantes, à revérifier sur Légifrance |
| AI Act : Omnibus publié au JOUE le 24/07/2026, haut risque annexe III au 02/12/2027, annexe I au 02/08/2028 | Sources juridiques secondaires, à vérifier sur EUR-Lex |
| Guide ANSSI/DGE « 13 questions », 2e édition octobre 2022 | Page DGE consultée |
| +49 % d'offres d'emploi cyber 2019-2024 | Attribué à l'Observatoire ANSSI par la presse, source primaire à confirmer |
| RSSI expérimenté > 100 k€ brut | Baromètres secondaires 2026, à confirmer |

## Risques résiduels

- Pages `.astro` non compilées dans cet environnement.
- Formulaires : 503 tant que les secrets Brevo ne sont pas définis. Endpoints Brevo écrits de mémoire, à vérifier.
- Le formulaire ressource envoie un email à l'adresse saisie : contenu fixe (aucun champ utilisateur repris) et rate limiting pour éviter le relais de spam.
- Le rapport détaillé du diagnostic n'est pas automatisé : la demande arrive par email et le rapport est rédigé par VD (délai annoncé : 48 h ouvrées).
- Pas de CAPTCHA : Turnstile nécessiterait un script tiers (incompatible avec la CSP actuelle). Pot de miel + rate limiting WAF en première ligne.
- `/mcp` implémenté mais désactivé : l'ouvrir seulement si le besoin est mesuré (voir `docs/mcp-spec.md`, section 1).
