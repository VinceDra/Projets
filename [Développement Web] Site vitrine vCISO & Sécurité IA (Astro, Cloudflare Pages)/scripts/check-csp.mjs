// Contrôle post-build : échoue si le HTML généré contient du JS/CSS inline
// incompatible avec la CSP (script-src 'self'; style-src 'self').
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
const problems = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) check(p, readFileSync(p, 'utf8'));
  }
};
const check = (file, html) => {
  // <script> sans src et hors application/ld+json = JS inline
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attrs = m[1];
    if (!/\bsrc=/.test(attrs) && !/application\/ld\+json/.test(attrs)) problems.push(`${file}: script inline`);
  }
  if (/<style\b/i.test(html)) problems.push(`${file}: <style> inline`);
  if (/\sstyle="/i.test(html)) problems.push(`${file}: attribut style=""`);
  if (/\son[a-z]+="/i.test(html)) problems.push(`${file}: gestionnaire d'événement inline`);
  if (/(src|href)="https?:\/\/(?!vd-cybersec\.fr)/i.test(html.replace(/<a\b[^>]*>/gi, ''))) problems.push(`${file}: ressource externe`);
};
walk(root);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('CSP check OK');
