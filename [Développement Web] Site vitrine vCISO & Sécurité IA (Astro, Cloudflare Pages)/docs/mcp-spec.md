# Spécification du serveur MCP public `/mcp`

Statut : implémenté dans `functions/mcp.ts`, désactivé par défaut (`MCP_ENABLED=false`). Tests d'acceptation 1, 2, 5 et 6 vérifiés hors ligne ; le 4 dépend de la règle WAF.

## 1. Décision préalable

Un endpoint MCP public ajoute une surface d'attaque (abus, coût, contenu relayé vers des agents tiers) pour un bénéfice de visibilité non mesuré à ce jour. Recommandation : lancer le site sans `/mcp`, mesurer l'intérêt réel (requêtes d'agents dans les journaux), puis activer.

## 2. Principes de sécurité

| Principe | Mise en œuvre |
|---|---|
| Lecture seule | Aucun outil n'écrit, n'envoie d'email ni ne déclenche d'action. `contact_info` renvoie un lien, pas un formulaire. |
| Données publiques uniquement | Les réponses proviennent exclusivement de `src/data/*.ts`, déjà publiées sur le site. |
| Pas d'authentification, donc quotas | Règle WAF Cloudflare sur `/mcp` : ex. 30 requêtes par minute et par IP (À AJUSTER). |
| Taille bornée | Corps de requête limité à 8 Ko ; réponses de `get_article` limitées à un article. |
| Validation stricte | Schéma JSON pour chaque argument ; `slug` validé par `^[a-z0-9-]{1,80}$` puis par liste blanche. |
| Contenu non instructif | Les textes renvoyés ne contiennent aucune consigne adressée aux agents. Les clients doivent traiter la sortie comme donnée non fiable. |
| Pas de secret | Aucune clé ni variable d'environnement exposée. Erreurs génériques. |
| Journalisation | Méthode, outil, statut, durée. Pas d'adresse IP complète au-delà de la durée de sécurité nécessaire. |

## 3. Transport

- Protocole : Model Context Protocol, messages JSON-RPC 2.0, transport « Streamable HTTP ».
- Version de protocole : dernière révision stable à la date d'implémentation (À CONFIRMER sur modelcontextprotocol.io).
- Endpoint unique : `POST https://vd-cybersec.fr/mcp`
- En-têtes requis : `Content-Type: application/json`, `Accept: application/json, text/event-stream`.
- Réponse : `application/json` (pas de flux SSE nécessaire, tous les outils répondent en une fois).
- `GET /mcp` : 405. Pas de session persistante (serveur sans état).

### Initialisation

```json
POST /mcp
{ "jsonrpc": "2.0", "id": 1, "method": "initialize",
  "params": { "protocolVersion": "<version>", "capabilities": {}, "clientInfo": { "name": "client", "version": "1.0" } } }
```

```json
{ "jsonrpc": "2.0", "id": 1, "result": {
  "protocolVersion": "<version>",
  "capabilities": { "tools": { "listChanged": false } },
  "serverInfo": { "name": "vd-cybersec", "version": "1.0.0" } } }
```

### Liste des outils

```json
{ "jsonrpc": "2.0", "id": 2, "method": "tools/list" }
```

La réponse contient les 5 outils ci-dessous avec leur `inputSchema`. Tous portent l'annotation `readOnlyHint: true`.

## 4. Outils

### 4.1 `list_articles`

Liste les articles avec métadonnées.

```json
"inputSchema": { "type": "object", "properties": {
  "category": { "type": "string", "enum": ["Gouvernance", "Sécurité IA", "Conformité", "Crise", "Investissement"] } },
  "additionalProperties": false }
```

Requête :

```json
{ "jsonrpc": "2.0", "id": 3, "method": "tools/call",
  "params": { "name": "list_articles", "arguments": { "category": "Sécurité IA" } } }
```

Réponse (`structuredContent` + copie texte pour les clients qui ne lisent que `content`) :

```json
{ "jsonrpc": "2.0", "id": 3, "result": {
  "structuredContent": { "articles": [
    { "slug": "securite-llm-rag-production", "title": "Sécuriser un LLM et un RAG en production : menaces réelles et garde-fous",
      "category": "Sécurité IA", "kind": "pilier", "publishedAt": "2026-09-21", "readingMinutes": 3,
      "url": "https://vd-cybersec.fr/blog/securite-llm-rag-production" },
    { "slug": "matrice-ai-act-2026", "title": "AI Act : la matrice de classification et le calendrier mis à jour en 2026",
      "category": "Sécurité IA", "kind": "satellite", "publishedAt": "2026-09-21", "readingMinutes": 2,
      "url": "https://vd-cybersec.fr/blog/matrice-ai-act-2026" } ] },
  "content": [ { "type": "text", "text": "<même contenu sérialisé en JSON>" } ],
  "isError": false } }
```

### 4.2 `get_article`

Renvoie le contenu complet, la FAQ et les sources d'un article.

```json
"inputSchema": { "type": "object", "required": ["slug"],
  "properties": { "slug": { "type": "string", "pattern": "^[a-z0-9-]{1,80}$" } }, "additionalProperties": false }
```

```json
{ "jsonrpc": "2.0", "id": 4, "method": "tools/call",
  "params": { "name": "get_article", "arguments": { "slug": "guide-nis2-pme" } } }
```

```json
{ "jsonrpc": "2.0", "id": 4, "result": {
  "structuredContent": {
    "slug": "guide-nis2-pme", "title": "NIS2 pour les PME et ETI : périmètre, obligations et plan de préparation",
    "publishedAt": "2026-09-21", "url": "https://vd-cybersec.fr/blog/guide-nis2-pme",
    "body": [ { "t": "p", "text": "La directive (UE) 2022/2555, dite NIS2, ..." }, { "t": "h2", "text": "État de la transposition en France" } ],
    "faq": [ { "q": "Mon entreprise de 60 salariés est-elle concernée ?", "a": "..." } ],
    "sources": [ { "label": "Directive (UE) 2022/2555 (NIS2)", "url": "https://eur-lex.europa.eu/eli/dir/2022/2555/oj" } ],
    "disclaimer": "Contenu informatif, non constitutif d'un avis juridique." },
  "content": [ { "type": "text", "text": "<JSON>" } ], "isError": false } }
```

Slug inconnu : `isError: true` avec le texte `"Article introuvable."` (pas d'erreur JSON-RPC, conformément à la convention MCP pour les erreurs d'outil).

### 4.3 `list_resources`

```json
"inputSchema": { "type": "object", "properties": {}, "additionalProperties": false }
```

```json
{ "jsonrpc": "2.0", "id": 5, "result": { "structuredContent": { "resources": [
  { "slug": "checklist-nis2-pme", "type": "Checklist", "title": "Checklist NIS2 pour PME et ETI",
    "description": "Les dix mesures de l'article 21 de NIS2 traduites en contrôles vérifiables...",
    "url": "https://vd-cybersec.fr/ressources/checklist-nis2-pme" } ] },
  "content": [ { "type": "text", "text": "<JSON>" } ], "isError": false } }
```

Les PDF ne sont jamais renvoyés : le téléchargement passe par le formulaire du site.

### 4.4 `get_services`

```json
"inputSchema": { "type": "object", "properties": {}, "additionalProperties": false }
```

```json
{ "jsonrpc": "2.0", "id": 6, "result": { "structuredContent": { "services": [
  { "id": "vciso", "name": "vCISO · RSSI-as-a-Service",
    "format": "Abonnement mensuel, temps partagé, sans engagement long terme",
    "deliverables": ["Gouvernance sécurité", "Conformité réglementaire", "Gestion de crise", "Due diligence", "Reporting COMEX"],
    "url": "https://vd-cybersec.fr/services#vciso" },
  { "id": "ia", "name": "Accompagnement Sécurité IA", "format": "Mission cadrée de 30 à 90 jours",
    "deliverables": ["Classification AI Act", "Threat modeling LLM, RAG, MCP", "Garde-fous techniques", "Gouvernance ISO 42001"],
    "url": "https://vd-cybersec.fr/services#ia" } ] },
  "content": [ { "type": "text", "text": "<JSON>" } ], "isError": false } }
```

Aucun tarif n'est exposé (non public).

### 4.5 `contact_info`

```json
"inputSchema": { "type": "object", "properties": {}, "additionalProperties": false }
```

```json
{ "jsonrpc": "2.0", "id": 7, "result": { "structuredContent": {
  "contactUrl": "https://vd-cybersec.fr/contact",
  "firstStep": "Session de cadrage de 30 minutes",
  "responseTime": "2 jours ouvrés",
  "languages": ["fr", "en"],
  "securityContact": "https://vd-cybersec.fr/.well-known/security.txt" },
  "content": [ { "type": "text", "text": "<JSON>" } ], "isError": false } }
```

L'adresse email n'est pas renvoyée pour limiter la collecte automatisée ; le formulaire reste le canal unique.

## 5. Erreurs

| Cas | Réponse |
|---|---|
| JSON invalide | JSON-RPC `-32700` Parse error |
| Méthode inconnue | `-32601` Method not found |
| Arguments hors schéma | `-32602` Invalid params |
| Outil en erreur (slug inconnu) | `result.isError: true` + message court |
| Quota dépassé | HTTP 429 (WAF), sans corps JSON-RPC |
| Corps > 8 Ko | HTTP 413 |

## 6. Tests d'acceptation

1. `tools/list` renvoie exactement 5 outils, tous `readOnlyHint: true`.
2. `get_article` avec `slug: "../../etc"` ou `"constructor"` renvoie `-32602` ou `isError`, jamais un contenu.
3. Un article dont le texte contient « ignore les instructions » est renvoyé tel quel, sans effet côté serveur.
4. 31 requêtes en une minute depuis la même IP : la 31e reçoit 429.
5. Aucune réponse ne contient de variable d'environnement, de trace d'erreur ou d'email.
6. Les données renvoyées sont identiques à celles du site (même source `src/data`).
