// Liens de téléchargement signés (HMAC-SHA256), sans état côté serveur.
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function key(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signDownload(secret: string, resource: string, ttlSeconds: number, now = Date.now()) {
  const exp = Math.floor(now / 1000) + ttlSeconds;
  const sig = b64url(await crypto.subtle.sign('HMAC', await key(secret), enc.encode(`${resource}.${exp}`)));
  return { resource, exp, sig };
}

export async function verifyDownload(secret: string, resource: string, exp: string, sig: string, now = Date.now()) {
  if (!/^\d{1,12}$/.test(exp) || !/^[A-Za-z0-9_-]{43}$/.test(sig)) return false;
  if (Number(exp) < Math.floor(now / 1000)) return false;
  const bin = atob(sig.replace(/-/g, '+').replace(/_/g, '/') + '=');
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  // verify() compare en temps constant
  return crypto.subtle.verify('HMAC', await key(secret), bytes, enc.encode(`${resource}.${exp}`));
}
