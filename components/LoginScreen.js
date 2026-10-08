'use client';

import { useState } from 'react';
import Logo from './Logo';
import { BRAND } from '@/lib/brand';
import { getLang, t as makeT } from '@/lib/ui-text';

export default function LoginScreen({ auth }) {
  const lang = getLang();
  const t = makeT(lang);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === '1';

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'login') {
        await auth.signIn(email.trim(), password);
      } else {
        const r = await auth.signUp(email.trim(), password);
        if (r.needsConfirm) { setInfo(t('confirmEmail')); setMode('login'); }
      }
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError(''); setInfo('');
    if (!email.trim()) { setError(t('enterEmail')); return; }
    try { await auth.resetPassword(email.trim()); setInfo(t('resetSent')); }
    catch (err) { setError(err.message || 'Error'); }
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#030303] flex items-center justify-center px-4 font-inter relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#22d3ee]/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[140px]" />

      <div className="w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <h1 className="text-xl font-bold text-white tracking-tight mt-4">{BRAND.name}</h1>
          <p className="text-white/40 text-[13px] mt-1">{BRAND.tagline}</p>
        </div>

        <h2 className="text-white font-semibold text-sm mb-4">{mode === 'login' ? t('loginTitle') : t('signupTitle')}</h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email')} autoComplete="email"
            className="w-full bg-white/5 border border-white/[0.06] rounded-md px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#22d3ee]/40"
          />
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full bg-white/5 border border-white/[0.06] rounded-md px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#22d3ee]/40"
          />

          {error && <p className="text-red-400/90 text-[12px]">{error}</p>}
          {info && <p className="text-emerald-400/90 text-[12px]">{info}</p>}

          <button
            type="submit" disabled={busy}
            className="w-full bg-[#22d3ee] text-black font-semibold py-2.5 rounded-md hover:bg-[#06b6d4] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {busy ? '…' : mode === 'login' ? t('login') : t('signup')}
          </button>
        </form>

        {googleEnabled && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" /><span className="text-white/30 text-xs">{t('or')}</span><div className="flex-1 h-px bg-white/10" />
            </div>
            <button
              onClick={auth.signInGoogle}
              className="w-full border border-white/10 bg-white/5 text-white/90 text-sm font-medium py-2.5 rounded-md hover:bg-white/10 transition-colors"
            >
              {t('google')}
            </button>
          </>
        )}

        <div className="mt-5 flex flex-col items-center gap-2 text-[12px]">
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }} className="text-white/50 hover:text-[#22d3ee] transition-colors">
            {mode === 'login' ? t('noAccount') : t('haveAccount')}
          </button>
          {mode === 'login' && (
            <button onClick={forgot} className="text-white/30 hover:text-white/60 transition-colors">{t('forgot')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
