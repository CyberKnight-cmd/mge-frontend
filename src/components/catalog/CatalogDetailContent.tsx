'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import {
  ChevronRight, BarChart3, MapPin, ShieldCheck, Send,
  TrendingUp, Zap, FileText, Globe, AlertCircle, ArrowLeft,
  Calculator, DollarSign, Check, Pencil, Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type CatalystType = 'CERAMIC' | 'DPF' | 'CERAMIC_DPF' | 'FOIL' | 'SET' | 'STEEL' | 'OTHER';

interface CatalystImage {
  id: number;
  imageUrl: string;
  originalFileName: string;
}

interface CatalystDetail {
  id: number;
  manufacturer: string;
  manufacturerBrand: string | null;
  region: string | null;
  primaryCode: string;
  secondaryCode: string | null;
  secondaryCode2: string | null;
  catalystType: CatalystType;
  ptPpm: number | null;
  pdPpm: number | null;
  rhPpm: number | null;
  weightPerPieceGrams: number | null;
  images: CatalystImage[];
}

interface MetalPrices {
  pt: number;
  pd: number;
  rh: number;
  fetchedAt: string;
}

interface Valuation {
  perGram: { usd: number; inr: number };
  perKg:   { usd: number; inr: number };
  perPiece: { weightGrams: number; usd: number; inr: number } | null;
}

// ── Animations ────────────────────────────────────────────────────────────────

const fadeUp: Variants    = { hidden: { opacity: 0, y: 24  }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const fadeLeft: Variants  = { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } };
const fadeRight: Variants = { hidden: { opacity: 0, x: 24  }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } };
const stagger: Variants   = { visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };
const rowAnim: Variants   = { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35 } } };

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<CatalystType, string> = {
  CERAMIC: 'Ceramic', DPF: 'DPF', CERAMIC_DPF: 'Ceramic+DPF',
  FOIL: 'Foil', SET: 'Set', STEEL: 'Steel', OTHER: 'Other',
};

function ppmBar(ppm: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((ppm / max) * 100);
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function fmtCurrency(value: number, currency: 'INR' | 'USD'): string {
  if (currency === 'INR') {
    return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CatalogDetailContent({ code }: { code: string }) {
  const { user, isAuthenticated, authFetch } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ── Server data ──────────────────────────────────────────────────────────
  const [entry, setEntry]       = useState<CatalystDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeImg, setActiveImg] = useState(0);

  // ── Editable PGM inputs ──────────────────────────────────────────────────
  const [ptPpm,       setPtPpm]       = useState('');
  const [pdPpm,       setPdPpm]       = useState('');
  const [rhPpm,       setRhPpm]       = useState('');
  const [weightGrams, setWeightGrams] = useState('');

  // ── Market data ──────────────────────────────────────────────────────────
  const [metalPrices, setMetalPrices] = useState<MetalPrices | null>(null);
  const [usdToInr,    setUsdToInr]    = useState<number | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  // Default to USD; switches to INR once the forex rate arrives
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState<{ text: string; ok: boolean } | null>(null);

  // ── Admin inline edit for specs ─────────────────────────────────────────
  const [editing,     setEditing]     = useState(false);
  const [editSaving,  setEditSaving]  = useState(false);
  const [editError,   setEditError]   = useState<string | null>(null);
  const [editFields,  setEditFields]  = useState({
    manufacturer: '', manufacturerBrand: '', region: '',
    primaryCode: '', secondaryCode: '', secondaryCode2: '',
    catalystType: 'OTHER' as CatalystType,
  });

  // ── Fetch catalog entry ──────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/v1/catalog/${code}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Catalog entry not found.' : 'Failed to load entry.');
        return r.json();
      })
      .then((body) => {
        const e: CatalystDetail = body.data ?? body;
        setEntry(e);
        if (e.ptPpm  != null) setPtPpm(String(e.ptPpm));
        if (e.pdPpm  != null) setPdPpm(String(e.pdPpm));
        if (e.rhPpm  != null) setRhPpm(String(e.rhPpm));
        if (e.weightPerPieceGrams != null) setWeightGrams(String(e.weightPerPieceGrams));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  // ── Fetch market prices once — independent fetches so one failure can't block the other
  useEffect(() => {
    fetch('/api/v1/metals/prices')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => {
        const prices: Array<{ symbol: string; priceUsd?: number }> =
          (body.data ?? body).prices ?? [];
        const pt = prices.find(p => p.symbol === 'XPT')?.priceUsd;
        const pd = prices.find(p => p.symbol === 'XPD')?.priceUsd;
        const rh = prices.find(p => p.symbol === 'XRH')?.priceUsd;
        if (pt && pd && rh) {
          setMetalPrices({ pt, pd, rh, fetchedAt: (body.data ?? body).fetchedAt ?? '' });
        }
      })
      .catch(() => {});

    fetch('/api/v1/forex/rates')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => {
        const fx = body.data ?? body;
        if (fx.usdToInr) {
          setUsdToInr(fx.usdToInr);
          setCurrency('INR'); // upgrade default to INR once rate is available
        }
      })
      .catch(() => {});
  }, []);

  // ── Client-side valuation (no API round-trip per keystroke) ─────────────
  // Requires metal prices. INR values are 0 when the forex rate hasn't loaded yet.
  const valuation = useMemo((): Valuation | null => {
    if (!metalPrices) return null;
    const pt = parseFloat(ptPpm) || 0;
    const pd = parseFloat(pdPpm) || 0;
    const rh = parseFloat(rhPpm) || 0;
    if (pt === 0 && pd === 0 && rh === 0) return null;

    const TERMS = 70;
    const GRAMS_PER_TROY_OZ = 31.1035;

    const totalUsdPerTon =
      (pt / GRAMS_PER_TROY_OZ) * (TERMS / 100) * metalPrices.pt +
      (pd / GRAMS_PER_TROY_OZ) * (TERMS / 100) * metalPrices.pd +
      (rh / GRAMS_PER_TROY_OZ) * (TERMS / 100) * metalPrices.rh;

    const usdPerKg   = totalUsdPerTon / 1000;
    const usdPerGram = usdPerKg / 1000;
    const rate       = usdToInr ?? 0;
    const inrPerKg   = usdPerKg   * rate;
    const inrPerGram = usdPerGram * rate;

    const w = parseFloat(weightGrams);
    return {
      perGram: { usd: round2(usdPerGram), inr: round2(inrPerGram) },
      perKg:   { usd: round2(usdPerKg),   inr: round2(inrPerKg) },
      perPiece: !isNaN(w) && w > 0 ? {
        weightGrams: w,
        usd: round2(w * usdPerGram),
        inr: round2(w * inrPerGram),
      } : null,
    };
  }, [ptPpm, pdPpm, rhPpm, weightGrams, metalPrices, usdToInr]);

  // ── Save to catalog ───────────────────────────────────────────────────────
  async function handleSave() {
    if (!isAuthenticated || !entry) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await authFetch(`/api/v1/catalog/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ptPpm:               ptPpm       ? parseFloat(ptPpm)       : null,
          pdPpm:               pdPpm       ? parseFloat(pdPpm)       : null,
          rhPpm:               rhPpm       ? parseFloat(rhPpm)       : null,
          weightPerPieceGrams: weightGrams ? parseFloat(weightGrams) : null,
        }),
      });
      if (!res.ok) throw new Error();
      const body = await res.json();
      setEntry(body.data ?? body);
      setSaveMsg({ text: 'Saved to catalog', ok: true });
    } catch {
      setSaveMsg({ text: 'Failed to save', ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  }

  const startEdit = useCallback(() => {
    if (!entry) return;
    setEditFields({
      manufacturer:      entry.manufacturer,
      manufacturerBrand: entry.manufacturerBrand ?? '',
      region:            entry.region ?? '',
      primaryCode:       entry.primaryCode,
      secondaryCode:     entry.secondaryCode ?? '',
      secondaryCode2:    entry.secondaryCode2 ?? '',
      catalystType:      entry.catalystType,
    });
    setEditError(null);
    setEditing(true);
  }, [entry]);

  const cancelEdit = useCallback(() => { setEditing(false); setEditError(null); }, []);

  async function saveEdit() {
    if (!entry) return;
    if (!editFields.primaryCode.trim() || !editFields.manufacturer.trim()) {
      setEditError('Primary code and manufacturer are required.');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await authFetch(`/api/v1/catalog/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturer:        editFields.manufacturer.trim(),
          manufacturerBrand:   editFields.manufacturerBrand.trim() || null,
          region:              editFields.region.trim() || null,
          primaryCode:         editFields.primaryCode.trim(),
          secondaryCode:       editFields.secondaryCode.trim() || null,
          secondaryCode2:      editFields.secondaryCode2.trim() || null,
          catalystType:        editFields.catalystType,
          ptPpm:               ptPpm  ? parseFloat(ptPpm)  : null,
          pdPpm:               pdPpm  ? parseFloat(pdPpm)  : null,
          rhPpm:               rhPpm  ? parseFloat(rhPpm)  : null,
          weightPerPieceGrams: weightGrams ? parseFloat(weightGrams) : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message ?? `Error ${res.status}`);
      }
      const body = await res.json();
      setEntry(body.data ?? body);
      setEditing(false);
    } catch (e: any) {
      setEditError(e.message ?? 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !entry) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-surface gap-4 px-4">
        <AlertCircle size={40} className="text-error" />
        <p className="text-headline-sm font-headline-sm text-on-surface">{error || 'Entry not found.'}</p>
        <Link href="/catalog" className="flex items-center gap-2 text-label-caps font-label-caps text-primary hover:underline">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    );
  }

  // ── Derived display values ────────────────────────────────────────────────
  const ptVal  = parseFloat(ptPpm)  || 0;
  const pdVal  = parseFloat(pdPpm)  || 0;
  const rhVal  = parseFloat(rhPpm)  || 0;
  const maxPpm = Math.max(ptVal, pdVal, rhVal);

  const pgmRows = [
    { element: 'PLATINUM (Pt)',  ppm: ptVal, color: 'bg-primary',   setter: setPtPpm, raw: ptPpm },
    { element: 'PALLADIUM (Pd)', ppm: pdVal, color: 'bg-secondary', setter: setPdPpm, raw: pdPpm },
    { element: 'RHODIUM (Rh)',   ppm: rhVal, color: 'bg-outline',   setter: setRhPpm, raw: rhPpm },
  ];

  const images       = entry.images ?? [];
  const currentImage = images[activeImg] ?? null;

  const specs = [
    { key: 'MANUFACTURER',     val: entry.manufacturer },
    { key: 'BRAND',            val: entry.manufacturerBrand ?? '—' },
    { key: 'REGION',           val: entry.region ?? '—' },
    { key: 'TYPE',             val: TYPE_LABELS[entry.catalystType] ?? entry.catalystType },
    { key: 'PRIMARY CODE',     val: entry.primaryCode },
    { key: 'SECONDARY CODE',   val: entry.secondaryCode ?? '—' },
    { key: 'SECONDARY CODE 2', val: entry.secondaryCode2 ?? '—' },
  ];

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary-container text-on-primary px-margin-mobile md:px-margin-desktop py-8 max-w-container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="w-full">
          <div className="flex items-center gap-2 text-label-caps font-label-caps text-on-primary-container mb-4">
            <Link href="/" className="hover:text-on-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/catalog" className="hover:text-on-primary transition-colors">Catalog</Link>
            <ChevronRight size={12} />
            <span className="text-on-primary">{entry.primaryCode}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-on-primary text-primary text-label-caps font-label-caps px-2 py-1">
                  {TYPE_LABELS[entry.catalystType] ?? entry.catalystType}
                </span>
                {entry.manufacturerBrand && (
                  <span className="border border-on-primary-container text-on-primary-container text-label-caps font-label-caps px-2 py-1">
                    {entry.manufacturerBrand.toUpperCase()}
                  </span>
                )}
              </div>
              <h1 className="font-mono text-[clamp(32px,5vw,48px)] font-bold tracking-tight text-on-primary">
                {entry.primaryCode}
              </h1>
              {entry.region && (
                <p className="text-on-primary-container text-body-sm flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {entry.region}
                </p>
              )}
            </div>
            <motion.div
              className="text-right"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="text-label-caps font-label-caps text-on-primary-container mb-1">CATALOG ID</div>
              <div className="font-mono text-[20px] font-bold text-on-primary">#{entry.id}</div>
              <div className="text-label-caps font-label-caps text-on-primary-container/60 text-[10px] mt-1">
                {entry.manufacturer}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left column 60% ───────────────────────────────────────────── */}
          <motion.div
            className="lg:w-[60%] flex flex-col gap-8"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Image gallery */}
            <motion.div className="grid grid-cols-4 gap-3" variants={fadeUp}>
              <div className="col-span-4 aspect-video bg-primary-container border border-outline-variant relative overflow-hidden group flex items-center justify-center">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, #bac8dc 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />
                {currentImage ? (
                  <Image src={currentImage.imageUrl} alt={entry.primaryCode} fill className="object-cover" unoptimized />
                ) : (
                  <BarChart3 size={64} className="text-on-primary-container/30 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="absolute top-3 left-3 bg-black/60 text-on-primary px-2 py-1 text-label-caps font-label-caps text-[10px] flex items-center gap-1">
                  <Zap size={10} /> {images.length > 0 ? 'CATALOG IMAGE' : 'NO IMAGE YET'}
                </div>
              </div>

              {images.slice(0, 3).map((img, i) => (
                <motion.div
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  whileHover={{ scale: 1.04, borderColor: '#000' }}
                  className={`aspect-square border cursor-pointer transition-colors relative overflow-hidden flex items-center justify-center ${activeImg === i ? 'border-primary' : 'border-outline-variant bg-surface-container'}`}
                >
                  <Image src={img.imageUrl} alt={`View ${i + 1}`} fill className="object-cover" unoptimized />
                </motion.div>
              ))}

              {Array.from({ length: Math.max(0, 3 - images.length) }).map((_, i) => (
                <div key={`ph-${i}`} className="aspect-square bg-surface-container border border-outline-variant flex items-center justify-center">
                  <BarChart3 size={20} className="text-on-surface-variant/20" />
                </div>
              ))}

              {images.length > 3 && (
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setActiveImg(3)}
                  className="aspect-square bg-surface-container-highest border border-outline-variant flex items-center justify-center cursor-pointer hover:border-secondary transition-colors"
                >
                  <span className="text-label-caps font-label-caps text-on-surface-variant text-center text-[10px]">
                    +{images.length - 3} More
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* PGM Analysis + input section */}
            <motion.div className="bg-surface-container-lowest border border-outline-variant accent-left" variants={fadeLeft}>
              {/* Display cards */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-headline-sm font-headline-sm flex items-center gap-2">
                    <BarChart3 size={18} className="text-secondary" />
                    PGM Analysis
                  </h2>
                  <div className="flex items-center gap-1 text-label-caps font-label-caps text-on-surface-variant">
                    <ShieldCheck size={12} />
                    {maxPpm > 0 ? 'XRF SPECTROMETRY DATA' : 'DATA PENDING'}
                  </div>
                </div>

                <motion.div
                  className="grid grid-cols-3 gap-4"
                  variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                >
                  {pgmRows.map(({ element, ppm, color }) => (
                    <motion.div
                      key={element}
                      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                      whileHover={{ y: -3 }}
                      className="bg-surface-container-low p-4 border-t-2 border-transparent hover:border-primary transition-colors"
                    >
                      <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">{element}</div>
                      <div className="font-mono text-[22px] font-bold leading-tight">
                        {ppm > 0 ? ppm.toLocaleString() : '—'}
                      </div>
                      <div className="font-mono text-[11px] text-secondary mt-1">
                        {ppm > 0 ? 'PPM' : 'Not measured'}
                      </div>
                      <div className="mt-3 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} transition-all duration-500`}
                          style={{ width: `${ppmBar(ppm, maxPpm)}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Input section */}
              <div className="border-t border-outline-variant px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Pencil size={13} className="text-secondary" />
                    <span className="text-label-caps font-label-caps">UPDATE ANALYSIS DATA</span>
                  </div>
                  {!isAuthenticated && (
                    <span className="text-[10px] text-outline font-label-caps">LOG IN TO SAVE</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {pgmRows.map(({ element, raw, setter }) => {
                    const short = element.split(' ')[0].toUpperCase();
                    return (
                      <div key={element}>
                        <label className="block text-[10px] text-label-caps font-label-caps text-on-surface-variant mb-1.5">
                          {short} PPM
                        </label>
                        <input
                          type="number"
                          value={raw}
                          onChange={e => setter(e.target.value)}
                          placeholder="0"
                          min={0}
                          className="w-full bg-surface-container border border-outline-variant text-on-surface px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mb-5">
                  <label className="block text-[10px] text-label-caps font-label-caps text-on-surface-variant mb-1.5">
                    WEIGHT PER PIECE (grams)
                  </label>
                  <input
                    type="number"
                    value={weightGrams}
                    onChange={e => setWeightGrams(e.target.value)}
                    placeholder="e.g. 1200"
                    min={0}
                    className="w-full bg-surface-container border border-outline-variant text-on-surface px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      whileHover={{ opacity: 0.85 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 bg-primary text-on-primary text-label-caps font-label-caps px-5 py-2.5 transition-opacity disabled:opacity-50"
                    >
                      <Save size={13} />
                      {saving ? 'SAVING…' : 'SAVE TO CATALOG'}
                    </motion.button>
                    {saveMsg && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-[11px] text-label-caps font-label-caps flex items-center gap-1 ${saveMsg.ok ? 'text-secondary' : 'text-error'}`}
                      >
                        {saveMsg.ok && <Check size={12} />}
                        {saveMsg.text}
                      </motion.span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-on-surface-variant">
                    <Link href="/auth/login" className="text-primary hover:underline">Log in</Link>
                    {' '}to save values to the catalog permanently.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Specs table */}
            <motion.div className="bg-surface-container-lowest border border-outline-variant" variants={fadeUp}>
              <div className="bg-surface-container px-6 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-secondary" />
                  <h2 className="text-label-caps font-label-caps">FULL CATALOG SPECIFICATIONS</h2>
                </div>
                {isAdmin && !editing && (
                  <button onClick={startEdit} className="flex items-center gap-1.5 text-label-caps font-label-caps text-[10px] text-primary hover:text-on-surface transition-colors">
                    <Pencil size={12} /> EDIT
                  </button>
                )}
              </div>

              {editing ? (
                <div className="p-6 space-y-4">
                  {editError && (
                    <div className="flex items-center gap-2 bg-error/10 border border-error/30 px-4 py-2.5 text-[13px] text-error">
                      <AlertCircle size={14} />{editError}
                    </div>
                  )}
                  {([
                    ['PRIMARY CODE',   'primaryCode',       'e.g. G654']  as const,
                    ['SECONDARY CODE', 'secondaryCode',     'e.g. CB15']  as const,
                    ['SECONDARY CODE 2','secondaryCode2',   'e.g. 8509241'] as const,
                    ['MANUFACTURER',   'manufacturer',      'e.g. MAZDA (TW)'] as const,
                    ['BRAND',          'manufacturerBrand', 'e.g. MAZDA'] as const,
                    ['REGION',         'region',            'e.g. TW, EU, IN'] as const,
                  ]).map(([label, field, placeholder]) => (
                    <div key={field} className="flex items-center gap-4">
                      <label className="w-1/3 text-label-caps font-label-caps text-[10px] text-on-surface-variant shrink-0">{label}</label>
                      <input
                        value={editFields[field]}
                        onChange={e => setEditFields(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="flex-1 bg-surface border border-outline-variant px-3 py-2 text-[13px] font-mono text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-4">
                    <label className="w-1/3 text-label-caps font-label-caps text-[10px] text-on-surface-variant shrink-0">TYPE</label>
                    <select
                      value={editFields.catalystType}
                      onChange={e => setEditFields(f => ({ ...f, catalystType: e.target.value as CatalystType }))}
                      className="flex-1 bg-surface border border-outline-variant px-3 py-2 text-[13px] font-mono text-on-surface focus:outline-none focus:border-primary transition-colors"
                    >
                      {(Object.keys(TYPE_LABELS) as CatalystType[]).map(t => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
                    <button
                      onClick={saveEdit}
                      disabled={editSaving}
                      className="flex items-center gap-2 bg-primary text-on-primary text-label-caps font-label-caps px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Save size={13} />
                      {editSaving ? 'SAVING…' : 'SAVE CHANGES'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={editSaving}
                      className="px-5 py-2.5 border border-outline-variant text-label-caps font-label-caps text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <motion.table className="w-full text-left" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                  <motion.tbody>
                    {specs.map(({ key, val }) => (
                      <motion.tr
                        key={key}
                        variants={rowAnim}
                        className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors last:border-0"
                      >
                        <td className="px-6 py-3 bg-surface-container-low text-label-caps font-label-caps w-1/3">{key}</td>
                        <td className="px-6 py-3">
                          {key === 'SECONDARY CODE' && val && val !== '—' ? (
                            <span className="bg-surface-container-high border border-outline-variant px-2 py-0.5 font-mono text-[12px]">
                              {val}
                            </span>
                          ) : (
                            <span className={`font-mono text-[13px] ${!val || val === '—' ? 'text-outline' : ''}`}>
                              {val || '—'}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                    {pgmRows.map(({ element, ppm }) => (
                      <motion.tr
                        key={element}
                        variants={rowAnim}
                        className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors last:border-0"
                      >
                        <td className="px-6 py-3 bg-surface-container-low text-label-caps font-label-caps w-1/3">{element}</td>
                        <td className="px-6 py-3 font-mono text-[13px] text-secondary">
                          {ppm > 0 ? `${ppm.toLocaleString()} PPM` : '—'}
                        </td>
                      </motion.tr>
                    ))}
                    <motion.tr variants={rowAnim} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-3 bg-surface-container-low text-label-caps font-label-caps w-1/3">WEIGHT / PIECE</td>
                      <td className="px-6 py-3 font-mono text-[13px] text-secondary">
                        {parseFloat(weightGrams) > 0 ? `${parseFloat(weightGrams).toLocaleString()} g` : '—'}
                      </td>
                    </motion.tr>
                  </motion.tbody>
                </motion.table>
              )}
            </motion.div>
          </motion.div>

          {/* ── Right column 40% ──────────────────────────────────────────── */}
          <motion.div
            className="lg:w-[40%] flex flex-col gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Live Valuation card */}
            <motion.div className="bg-surface-container-lowest border border-outline-variant accent-left" variants={fadeRight}>
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-label-caps font-label-caps flex items-center gap-2">
                  <DollarSign size={13} className="text-secondary" />
                  LIVE VALUATION
                </h3>
                <div className="flex items-center gap-1">
                  {(['INR', 'USD'] as const).map(c => {
                    const disabled = c === 'INR' && !usdToInr;
                    return (
                      <button
                        key={c}
                        onClick={() => !disabled && setCurrency(c)}
                        title={disabled ? 'INR rate loading…' : undefined}
                        className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 transition-colors ${
                          disabled
                            ? 'bg-surface-container text-outline border border-outline-variant cursor-wait opacity-40'
                            : currency === c
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-5">
                {!metalPrices ? (
                  <div className="py-4 text-center text-on-surface-variant">
                    <div className="w-5 h-5 border border-outline-variant border-t-secondary rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-body-sm">Loading market prices…</p>
                    <p className="text-[10px] mt-1 text-outline">Fetched at 03:00, 11:00 &amp; 19:00 IST</p>
                  </div>
                ) : !valuation ? (
                  <div className="py-4 text-center text-on-surface-variant">
                    <Calculator size={26} className="mx-auto mb-3 text-outline" />
                    <p className="text-body-sm">Enter Pt, Pd, Rh values to calculate.</p>
                    <p className="text-[10px] mt-1 text-outline">Use the inputs in the analysis section.</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-outline-variant">
                      {[
                        { label: 'PER GRAM', usd: valuation.perGram.usd, inr: valuation.perGram.inr },
                        { label: 'PER KG',   usd: valuation.perKg.usd,   inr: valuation.perKg.inr },
                        ...(valuation.perPiece ? [{
                          label: `PER PIECE (${valuation.perPiece.weightGrams.toLocaleString()}g)`,
                          usd: valuation.perPiece.usd,
                          inr: valuation.perPiece.inr,
                        }] : []),
                      ].map(({ label, usd, inr }) => (
                        <div key={label} className="flex items-center justify-between py-3">
                          <span className="text-[10px] text-label-caps font-label-caps text-on-surface-variant">{label}</span>
                          <motion.span
                            key={`${label}-${currency}-${usd}`}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="font-mono text-[18px] font-bold text-on-surface"
                          >
                            {fmtCurrency(currency === 'USD' ? usd : inr, currency)}
                          </motion.span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant space-y-1.5">
                      <div className="text-[10px] font-mono text-outline leading-relaxed">
                        Pt ${metalPrices.pt.toLocaleString()} · Pd ${metalPrices.pd.toLocaleString()} · Rh ${metalPrices.rh.toLocaleString()} /troy oz
                      </div>
                      <div className="text-[10px] text-outline">
                        $1 = ₹{usdToInr?.toLocaleString('en-IN')} · Terms 70% · LBMA spot
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Quote form */}
            <motion.div className="bg-primary-container text-on-primary p-6" variants={fadeRight}>
              <h3 className="text-headline-sm font-headline-sm text-primary-fixed-dim mb-5">Request a Quote</h3>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                {[
                  { label: 'FULL NAME',    type: 'text' },
                  { label: 'COMPANY NAME', type: 'text' },
                  { label: 'EMAIL',        type: 'email' },
                ].map(({ label, type }) => (
                  <div key={label}>
                    <label className="block text-label-caps font-label-caps text-on-primary-fixed-variant mb-1.5">{label}</label>
                    <input
                      type={type}
                      className="w-full bg-tertiary-container border border-outline text-on-primary px-4 py-3 focus:border-primary-fixed-dim focus:ring-0 focus:outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-label-caps font-label-caps text-on-primary-fixed-variant mb-1.5">QUANTITY (UNITS)</label>
                  <input
                    type="number"
                    defaultValue={1}
                    min={1}
                    className="w-full bg-tertiary-container border border-outline text-on-primary px-4 py-3 focus:border-primary-fixed-dim focus:ring-0 focus:outline-none font-mono"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ opacity: 0.85 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-on-primary text-primary text-label-caps font-label-caps py-4 mt-2 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send size={14} /> SEND INQUIRY
                </motion.button>
                <p className="text-[10px] text-on-primary-container text-center">
                  Inquiries processed within 2 business hours.
                </p>
              </form>
            </motion.div>

            {/* Available sellers */}
            <motion.div className="bg-surface-container-lowest border border-outline-variant" variants={fadeRight}>
              <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-label-caps font-label-caps flex items-center gap-2">
                  <Globe size={13} className="text-secondary" />
                  AVAILABLE FROM SELLERS
                </h3>
                <span className="text-[11px] bg-surface-container text-outline px-2 py-0.5 font-bold border border-outline-variant">
                  COMING SOON
                </span>
              </div>
              <div className="px-5 py-8 text-center">
                <Globe size={28} className="text-outline mx-auto mb-3" />
                <p className="text-body-sm text-on-surface-variant">
                  Seller listings for this entry will appear here once the marketplace is live.
                </p>
                <p className="text-label-caps font-label-caps text-[10px] text-outline mt-2">
                  Use the quote form to enquire directly.
                </p>
              </div>
            </motion.div>

            {/* PGM Market Trend */}
            <motion.div
              className="bg-surface-container border border-outline-variant p-5"
              variants={fadeRight}
              whileHover={{ borderColor: '#000' }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-label-caps font-label-caps mb-1 flex items-center gap-2">
                <TrendingUp size={13} className="text-primary" />
                PGM MARKET TREND (24H)
              </h4>
              <p className="text-[10px] text-outline mb-3">
                {metalPrices
                  ? `Last updated: ${metalPrices.fetchedAt}`
                  : 'Indicative — fetched 3× daily at 03:00, 11:00, 19:00 IST'}
              </p>
              <div className="h-20 w-full flex items-end gap-1 px-1">
                {[40, 45, 42, 55, 60, 58, 75, 82, 70, 78, 85, 80].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.6 + i * 0.04, duration: 0.4 }}
                    className={`flex-1 ${i >= 8 ? 'bg-primary' : 'bg-secondary-container'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono text-on-surface-variant">
                <span>08:00 AM</span><span>INDICATIVE</span><span>04:00 PM</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
