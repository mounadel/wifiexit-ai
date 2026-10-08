'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateI2V, uploadFile } from 'studio';
import { EFFECTS, EFFECTS_MODEL } from '@/lib/effects';
import { getLang, t as makeT } from '@/lib/ui-text';

const GALLERY_KEY = 'wifiexit_effects_gallery';
const RATIOS = ['9:16', '16:9', '1:1'];

export default function EffectsStudio({ apiKey, onGenerationStart, onGenerationEnd, onGenerationComplete, onGenerationError }) {
  const lang = getLang();
  const t = makeT(lang);
  const fileRef = useRef(null);

  const [effect, setEffect] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ratio, setRatio] = useState('9:16');
  const [busy, setBusy] = useState(false);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    try { setGallery(JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]')); } catch { /* ignore */ }
  }, []);

  const pushGallery = useCallback((item) => {
    setGallery((prev) => {
      const next = [item, ...prev].slice(0, 12);
      try { localStorage.setItem(GALLERY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const onFile = async (file) => {
    if (!file) return;
    setError(''); setImageUrl(null); setVideo(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true); setProgress(0);
    try {
      const url = await uploadFile(apiKey, file, setProgress);
      setImageUrl(url);
    } catch (e) {
      setError(e.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const generate = async () => {
    setError('');
    if (!imageUrl) { setError(t('needPhoto')); return; }
    if (!effect) { setError(t('needEffect')); return; }
    setBusy(true); setVideo(null);
    onGenerationStart?.();
    try {
      const res = await generateI2V(apiKey, {
        model: EFFECTS_MODEL,
        prompt: effect.prompt,
        image_url: imageUrl,
        aspect_ratio: ratio,
        duration: 5,
      });
      if (!res?.url) throw new Error('No video returned');
      setVideo(res.url);
      pushGallery({ url: res.url, effect: effect.name, at: Date.now() });
      onGenerationComplete?.({ url: res.url });
    } catch (e) {
      const msg = e?.message || 'Generation failed';
      setError(msg);
      onGenerationError?.(e);
    } finally {
      setBusy(false);
      onGenerationEnd?.();
    }
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="h-full w-full overflow-y-auto custom-scrollbar bg-[#030303] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('effectsTitle')}</h1>
        <p className="text-white/40 text-sm mt-1 mb-6">{t('effectsSub')}</p>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          {/* Colonne gauche : photo + options */}
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onFile(e.dataTransfer.files?.[0]); }}
              className="relative aspect-[3/4] rounded-2xl border border-dashed border-white/15 bg-white/[0.03] hover:border-[#22d3ee]/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center text-white/40 text-sm px-6">
                  <div className="text-4xl mb-2">🖼️</div>{t('uploadPhoto')}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-sm">{progress}%</div>
              )}
              {preview && !uploading && (
                <div className="absolute bottom-2 inset-x-2 text-center text-[11px] bg-black/60 rounded-md py-1 text-white/70">{t('changePhoto')}</div>
              )}
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>

            <div>
              <div className="text-xs font-bold text-white/30 mb-2">{t('ratio')}</div>
              <div className="flex gap-2">
                {RATIOS.map((r) => (
                  <button key={r} onClick={() => setRatio(r)}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold border transition-colors ${ratio === r ? 'bg-[#22d3ee] text-black border-[#22d3ee]' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={busy || uploading}
              className="w-full py-3 rounded-lg bg-[#22d3ee] text-black font-bold hover:bg-[#06b6d4] active:scale-[0.98] transition-all disabled:opacity-50">
              {busy ? t('generating') : `✨ ${t('generate')}`}
            </button>
            {error && <p className="text-red-400/90 text-[12px] break-words">{error}</p>}
          </div>

          {/* Colonne droite : effets + résultat */}
          <div>
            <div className="text-xs font-bold text-white/30 mb-3">{t('pickEffect')}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {EFFECTS.map((fx) => (
                <button key={fx.id} onClick={() => setEffect(fx)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border text-left p-3 flex flex-col justify-end transition-all bg-gradient-to-br ${fx.gradient} ${effect?.id === fx.id ? 'border-[#22d3ee] ring-2 ring-[#22d3ee]/40 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}>
                  {fx.preview && (
                    <video src={fx.preview} muted loop playsInline autoPlay className="absolute inset-0 w-full h-full object-cover opacity-70" />
                  )}
                  <div className="relative">
                    <div className="text-2xl mb-1">{fx.emoji}</div>
                    <div className="text-sm font-semibold drop-shadow">{fx.name}</div>
                  </div>
                </button>
              ))}
            </div>

            {video && (
              <div className="mt-8">
                <div className="text-xs font-bold text-white/30 mb-3">{t('result')}</div>
                <video src={video} controls autoPlay loop playsInline className="w-full max-w-md rounded-xl border border-white/10 bg-black" />
                <a href={video} target="_blank" rel="noreferrer" download className="inline-block mt-3 text-xs text-[#22d3ee] hover:underline">{t('download')}</a>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="mt-8">
                <div className="text-xs font-bold text-white/30 mb-3">{t('mine')}</div>
                <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2">
                  {gallery.map((g) => (
                    <button key={g.url} onClick={() => setVideo(g.url)} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 hover:border-[#22d3ee]/60">
                      <video src={g.url} muted playsInline className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 right-1 text-[10px] bg-black/60 rounded px-1 truncate">{g.effect}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
