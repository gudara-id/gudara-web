// Signed, expiring admin session tokens.
// Uses Web Crypto (available in both the Node.js and Edge runtimes on Vercel),
// so no extra dependency (e.g. jsonwebtoken) is required.
//
// Token shape: `${base64url(payload)}.${base64url(hmac-sha256 signature)}`
// payload = { exp: <unix ms timestamp> }
//
// This replaces sending ADMIN_SESSION_SECRET itself as the cookie value:
// that static value never expires and can't be revoked without rotating
// the secret (which breaks the admin's own session too). A signed token
// with an embedded expiry can be verified without any server-side storage,
// while still expiring on its own and not directly exposing the secret.

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function toBase64Url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createAdminSessionToken(secret) {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload));
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;

  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return false;

  try {
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

// Constant-time-ish comparison for the admin password check. Hashing both
// sides first means the comparison is always over equal-length digests,
// so the raw password's length/content can't be inferred from short-circuit
// string comparison timing.
export async function safeCompare(a, b) {
  const enc = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(String(a))),
    crypto.subtle.digest('SHA-256', enc.encode(String(b))),
  ]);
  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
}
