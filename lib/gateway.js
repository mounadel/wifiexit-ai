// Utilitaires partagés (middleware Edge + routes Node) : auth Supabase, quota, coûts.
// Utilise uniquement fetch → compatible Edge runtime.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const DAILY_CREDITS = parseInt(process.env.DAILY_CREDITS || '20', 10);

// ---------- Auth : vérifie le token Supabase (avec petit cache mémoire) ----------
const tokenCache = new Map(); // token -> { user, until }
const CACHE_MS = 60_000;

export async function verifyToken(token) {
  if (!token || !SUPABASE_URL || !ANON_KEY) return null;
  const now = Date.now();
  const hit = tokenCache.get(token);
  if (hit && hit.until > now) return hit.user;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { tokenCache.delete(token); return null; }
    const u = await res.json();
    if (!u?.id) return null;
    const user = { id: u.id, email: u.email || '' };
    if (tokenCache.size > 500) tokenCache.clear();
    tokenCache.set(token, { user, until: now + CACHE_MS });
    return user;
  } catch {
    return null;
  }
}

// ---------- Quota (RPC Postgres via REST, clé service) ----------
async function rpc(fn, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`rpc ${fn} failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getUsage(userId) {
  const rows = await rpc('get_usage', { p_user: userId, p_default_limit: DAILY_CREDITS });
  const row = Array.isArray(rows) ? rows[0] : rows;
  const used = row?.used_total ?? 0;
  const limit = row?.daily_limit ?? DAILY_CREDITS;
  return { used, limit, balance: Math.max(0, limit - used) };
}

export async function consume(userId, amount) {
  const rows = await rpc('consume_credits', { p_user: userId, p_amount: amount, p_default_limit: DAILY_CREDITS });
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { ok: !!row?.ok, used: row?.used_total ?? 0, limit: row?.daily_limit ?? DAILY_CREDITS };
}

export async function refund(userId, amount) {
  try { await rpc('refund_credits', { p_user: userId, p_amount: amount }); } catch { /* best effort */ }
}

// ---------- Coût d'une génération ----------
const FREE = /(estimate-cost|upload_file|get_upload|upload-binary|predictions|account\/balance|^models(\/|$))/i;
const VIDEO = /(video|i2v|t2v|v2v|kling|veo|sora|seedance|hailuo|minimax|wan|vidu|pixverse|ltx|runway|luma|pika|lipsync|lip-sync|motion|recast|clipping|animate|avatar|happy-?horse|marketing)/i;
const AUDIO = /(audio|music|speech|tts|voice|sound|song)/i;

function parseOverrides() {
  try { return JSON.parse(process.env.COST_OVERRIDES || '{}'); } catch { return {}; }
}

export function classifyCost(method, path) {
  if (method !== 'POST') return 0;
  const p = (path || '').replace(/^\/+/, '');
  if (FREE.test(p)) return 0;

  const overrides = parseOverrides();
  for (const [needle, cost] of Object.entries(overrides)) {
    if (p.toLowerCase().includes(needle.toLowerCase())) return Number(cost) || 0;
  }
  if (VIDEO.test(p)) return parseInt(process.env.COST_VIDEO || '10', 10);
  if (AUDIO.test(p)) return parseInt(process.env.COST_AUDIO || '2', 10);
  return parseInt(process.env.COST_IMAGE || '1', 10);
}

// ---------- Endpoints interdits (compte muapi partagé = privé pour le propriétaire) ----------
const BLOCKED_V1 = /^(account\/(?!balance)|history|api[_-]?keys?|keys?(\/|$)|billing|payment|stripe|webhook|team|org|user|profile|admin|white-?label|sessions?|subscription|credits?\/(?!$))/i;

export function isBlockedV1(path) {
  return BLOCKED_V1.test((path || '').replace(/^\/+/, ''));
}
