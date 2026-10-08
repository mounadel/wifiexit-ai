'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STORE = 'wifiexit_session';

async function gotrue(path, { method = 'POST', body, token } = {}) {
  const res = await fetch(`${SB_URL}/auth/v1/${path}`, {
    method,
    headers: {
      apikey: SB_ANON,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.message || data.error || `Error ${res.status}`);
  }
  return data;
}

function toSession(d) {
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
    user: { id: d.user?.id, email: d.user?.email },
  };
}

function readStored() {
  try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; }
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  const persist = useCallback((s) => {
    setSession(s);
    try {
      if (s) localStorage.setItem(STORE, JSON.stringify(s));
      else localStorage.removeItem(STORE);
    } catch { /* ignore */ }
  }, []);

  const refresh = useCallback(async (s) => {
    try {
      const d = await gotrue('token?grant_type=refresh_token', { body: { refresh_token: s.refresh_token } });
      const next = toSession(d);
      persist(next);
      return next;
    } catch {
      persist(null);
      return null;
    }
  }, [persist]);

  // Démarrage : retour OAuth (#access_token=...) ou session stockée
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (window.location.hash.includes('access_token=')) {
          const p = new URLSearchParams(window.location.hash.slice(1));
          const access_token = p.get('access_token');
          const refresh_token = p.get('refresh_token');
          if (access_token && refresh_token) {
            const user = await gotrue('user', { method: 'GET', token: access_token });
            const expires_in = parseInt(p.get('expires_in') || '3600', 10);
            if (!cancelled) {
              persist({
                access_token, refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + expires_in,
                user: { id: user.id, email: user.email },
              });
            }
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            return;
          }
        }
        const stored = readStored();
        if (stored?.access_token) {
          if (stored.expires_at - Math.floor(Date.now() / 1000) < 60) {
            const next = await refresh(stored);
            if (cancelled) return;
            if (next) setSession(next);
          } else if (!cancelled) {
            setSession(stored);
          }
        }
      } catch {
        persist(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [persist, refresh]);

  // Rafraîchit le token avant son expiration
  useEffect(() => {
    clearTimeout(timer.current);
    if (!session) return undefined;
    const ms = Math.max(5000, (session.expires_at - 60) * 1000 - Date.now());
    timer.current = setTimeout(() => { refresh(session); }, ms);
    return () => clearTimeout(timer.current);
  }, [session, refresh]);

  const signIn = useCallback(async (email, password) => {
    const d = await gotrue('token?grant_type=password', { body: { email, password } });
    persist(toSession(d));
  }, [persist]);

  const signUp = useCallback(async (email, password) => {
    const d = await gotrue('signup', { body: { email, password } });
    if (d.access_token) { persist(toSession(d)); return { needsConfirm: false }; }
    return { needsConfirm: true };
  }, [persist]);

  const signInGoogle = useCallback(() => {
    const redirect = encodeURIComponent(`${window.location.origin}/studio`);
    window.location.href = `${SB_URL}/auth/v1/authorize?provider=google&redirect_to=${redirect}`;
  }, []);

  const resetPassword = useCallback(async (email) => {
    await gotrue('recover', { body: { email } });
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!session) return;
    await gotrue('user', { method: 'PUT', token: session.access_token, body: { password } });
  }, [session]);

  const signOut = useCallback(async () => {
    const token = session?.access_token;
    persist(null);
    if (token) { try { await gotrue('logout', { token }); } catch { /* ignore */ } }
  }, [session, persist]);

  return { session, loading, signIn, signUp, signInGoogle, resetPassword, updatePassword, signOut };
}
