'use client';

import { useState } from 'react';
import { getLang, t as makeT } from '@/lib/ui-text';

export default function AccountModal({ auth, quota, onClose }) {
  const lang = getLang();
  const t = makeT(lang);
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const changePwd = async () => {
    setMsg(''); setErr('');
    if (pwd.length < 6) { setErr('6+'); return; }
    try { await auth.updatePassword(pwd); setPwd(''); setMsg(t('passwordChanged')); }
    catch (e) { setErr(e.message || 'Error'); }
  };

  const used = quota?.used ?? 0;
  const limit = quota?.limit ?? 0;
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up px-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-7 w-full max-w-sm shadow-2xl">
        <h2 className="text-white font-bold text-lg mb-1">{t('account')}</h2>
        <p className="text-white/50 text-[13px] mb-6 break-all">{auth.session?.user?.email}</p>

        <div className="bg-white/5 border border-white/[0.04] rounded-md p-4 mb-4">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>{t('creditsToday')}</span>
            <span className="text-white font-semibold">{quota ? `${quota.balance} / ${limit}` : '---'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#22d3ee] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-white/30 text-[11px] mt-2">{t('resets')}</p>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-white/30 mb-2">{t('newPassword')}</label>
          <div className="flex gap-2">
            <input
              type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password"
              className="flex-1 bg-white/5 border border-white/[0.06] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22d3ee]/40"
            />
            <button onClick={changePwd} className="px-3 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/10">{t('change')}</button>
          </div>
          {msg && <p className="text-emerald-400/90 text-[12px] mt-2">{msg}</p>}
          {err && <p className="text-red-400/90 text-[12px] mt-2">{err}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={auth.signOut} className="flex-1 h-10 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all">{t('logout')}</button>
          <button onClick={onClose} className="flex-1 h-10 rounded-md bg-white/5 text-white/80 hover:bg-white/10 text-xs font-semibold transition-all border border-white/5">{t('close')}</button>
        </div>
      </div>
    </div>
  );
}
