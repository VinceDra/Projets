// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vd-cybersec.fr', // À REMPLACER si le domaine change
  output: 'static',
  trailingSlash: 'never',
  build: {
    // /services -> services.html : Cloudflare Pages sert /services sans redirection
    format: 'file',
    // CSP style-src 'self' : aucune feuille inline dans le HTML généré
    inlineStylesheets: 'never',
  },
  // Aucun script n'est traité par Astro : tous les <script src> pointent vers /public/js (is:inline)
  devToolbar: { enabled: false },
});
