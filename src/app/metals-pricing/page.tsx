'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart3, TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────

interface MetalPrice {
  symbol: string;
  displaySymbol: string;
  name: string;
  priceUsd: number | null;
  changePct: number | null;
  live: boolean;
  note?: string;
}

interface MetalsPricingResponse {
  prices: MetalPrice[];
  fetchedAt: string;
  source: string;
  cacheAgeSeconds: number;
}

type Period = '1D' | '1W' | '1M' | 'YTD';

// ── Constants ──────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5 * 60 * 1000; // match backend cache TTL

// Static indicative fixings — real LPPM data requires institutional access
const FIXINGS = [
  { date: 'May 26, 2025', am: '$945.00', pm: '$942.50' },
  { date: 'May 25, 2025', am: '$951.00', pm: '$948.00' },
  { date: 'May 24, 2025', am: '$938.50', pm: '$941.00' },
  { date: 'May 23, 2025', am: '$940.00', pm: '$943.50' },
  { date: 'May 22, 2025', am: '$935.00', pm: '$937.50' },
  { date: 'May 21, 2025', am: '$928.00', pm: '$931.00' },
];

const fadeUp: import('framer-motion').Variants  = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger: import('framer-motion').Variants = { visible: { transition: { staggerChildren: 0.1 } } };

// ── Component ───────────────────────────────────────────────────────────────

export default function MetalsPricingPage() {
  const { authFetch } = useAuth();
  const [data, setData]             = useState<MetalsPricingResponse | null>(null);
  const [loadError, setLoadError]   = useState('');
  const [activePeriod, setActivePeriod] = useState<Period>('1D');
  const [clockTime, setClockTime]   = useState('');

  // Keep up to 7 historical price points per symbol for the mini bar charts
  const historyRef = useRef<Record<string, number[]>>({ XPT: [], XPD: [], XRH: [] });

  // 1-second clock
  useEffect(() => {
    const tick = () => setSyncTime();
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function setSyncTime() {
    setClockTime(new Date().toISOString().split('T')[1].split('.')[0] + ' UTC');
  }

  // Fetch prices + poll
  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const res  = await authFetch('/api/v1/metals/prices');
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(body.message ?? 'Failed to load prices');
        const d: MetalsPricingResponse = body.data ?? body;

        // Append latest live prices to history (cap at 7 points)
        d.prices.forEach((m) => {
          if (m.live && m.priceUsd != null) {
            const h = historyRef.current[m.symbol] ?? [];
            historyRef.current[m.symbol] = [...h, m.priceUsd].slice(-7);
          }
        });

        setData(d);
        setLoadError('');
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Network error');
      }
    }

    fetchPrices();
    const id = setInterval(fetchPrices, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────

  function formatPrice(p: number | null): string {
    if (p == null) return '—';
    return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function barHeights(symbol: string): number[] {
    const hist = historyRef.current[symbol] ?? [];
    if (hist.length < 2) return [50, 50, 50, 50, 50, 50, 50];
    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const range = max - min || 1;
    // Pad to 7 points
    const padded = [...Array(Math.max(0, 7 - hist.length)).fill(hist[0] ?? 50), ...hist];
    return padded.map((v) => Math.round(20 + ((v - min) / range) * 75));
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const metals = data?.prices ?? [
    { symbol: 'XPT', displaySymbol: 'Pt', name: 'PLATINUM',  priceUsd: null, changePct: null, live: false },
    { symbol: 'XPD', displaySymbol: 'Pd', name: 'PALLADIUM', priceUsd: null, changePct: null, live: false },
    { symbol: 'XRH', displaySymbol: 'Rh', name: 'RHODIUM',   priceUsd: null, changePct: null, live: false },
  ];

  const ptPrice = metals.find((m) => m.symbol === 'XPT');
  const pdPrice = metals.find((m) => m.symbol === 'XPD');

  return (
    <div className="flex">
      <Sidebar />

      <div className="lg:ml-[240px] w-full min-h-[calc(100vh-64px)] matrix-bg">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface-container-lowest border-b-4 border-primary px-margin-mobile md:px-margin-desktop py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shadow-sm"
        >
          <div>
            <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight uppercase">
              Metals Pricing Terminal
            </h1>
            <p className="text-body-md text-secondary mt-1">
              Live Spot Prices · Pt, Pd &amp; Rh via api.metals.live · No API key required
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-surface-container p-3 border-l-2 border-primary">
              <p className="text-label-caps font-label-caps text-secondary">Data Source</p>
              <p className="font-mono text-[13px] text-primary flex items-center gap-1">
                {loadError ? (
                  <span className="text-error flex items-center gap-1"><AlertCircle size={12} /> Error</span>
                ) : data ? (
                  <span className="flex items-center gap-1"><RefreshCw size={12} /> {data.source}</span>
                ) : (
                  <span className="text-outline animate-pulse">Loading…</span>
                )}
              </p>
            </div>
            <div className="bg-surface-container p-3 border-l-2 border-primary">
              <p className="text-label-caps font-label-caps text-secondary">Last Sync</p>
              <p className="font-mono text-[13px] text-primary">
                {data?.fetchedAt
                  ? new Date(data.fetchedAt).toISOString().split('T')[1].split('.')[0] + ' UTC'
                  : clockTime || '—'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error banner */}
        {loadError && (
          <div className="mx-margin-mobile md:mx-margin-desktop mt-4 flex items-center gap-2 bg-error/10 border border-error/30 px-4 py-3">
            <AlertCircle size={14} className="text-error shrink-0" />
            <p className="text-body-sm text-error">{loadError} — showing last cached data.</p>
          </div>
        )}

        <div className="p-margin-mobile md:p-margin-desktop">
          <div className="grid grid-cols-12 gap-gutter">

            {/* Live price cards */}
            {metals.map((metal, i) => {
              const bars = barHeights(metal.symbol);
              const chg  = metal.changePct;
              return (
                <motion.div
                  key={metal.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-primary" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-label-caps font-label-caps text-secondary bg-surface-container px-2 py-1">
                      {metal.name} ({metal.displaySymbol})
                    </span>
                    {metal.live ? (
                      <span className={`font-mono text-[13px] flex items-center gap-1 ${
                        chg == null ? 'text-secondary'
                          : chg > 0 ? 'text-green-600'
                          : chg < 0 ? 'text-error'
                          : 'text-secondary'
                      }`}>
                        {chg == null    ? <Minus size={13} /> :
                         chg > 0       ? <TrendingUp size={13} /> :
                         chg < 0       ? <TrendingDown size={13} /> :
                                         <Minus size={13} />}
                        {chg == null ? '—' : `${chg > 0 ? '+' : ''}${chg.toFixed(2)}%`}
                      </span>
                    ) : (
                      <span className="text-label-caps font-label-caps text-[10px] text-outline border border-outline-variant px-2 py-0.5">
                        {metal.symbol === 'XRH' ? 'OTC' : 'OFFLINE'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    {metal.live && metal.priceUsd != null ? (
                      <>
                        <span className="text-headline-md font-headline-md font-bold">
                          {formatPrice(metal.priceUsd)}
                        </span>
                        <span className="text-body-sm text-secondary">USD/oz</span>
                      </>
                    ) : (
                      <span className="text-body-md text-outline">{metal.note ?? 'Unavailable'}</span>
                    )}
                  </div>

                  {/* Mini bar chart — built from rolling price history */}
                  <div className="mt-4 h-12 w-full bg-surface-container-low flex items-end gap-[2px] p-1">
                    {bars.map((h, bi) => (
                      <div
                        key={bi}
                        className={`flex-1 transition-all duration-700 ${metal.live ? 'bg-primary' : 'bg-outline-variant'}`}
                        style={{ height: `${h}%`, opacity: bi > 4 ? 1 - (6 - bi) * 0.15 : 0.6 + bi * 0.07 }}
                      />
                    ))}
                  </div>
                  {chg != null && (
                    <p className="text-[9px] text-outline mt-1 font-mono">vs. prev snapshot</p>
                  )}
                </motion.div>
              );
            })}

            {/* Performance matrix */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant flex flex-col">
              <div className="p-5 border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="text-headline-sm font-headline-sm uppercase tracking-tight">
                    Industrial Performance Matrix
                  </h3>
                  <p className="text-[10px] text-outline mt-0.5">Indicative — historical data module coming soon</p>
                </div>
                <div className="flex gap-2">
                  {(['1D', '1W', '1M', 'YTD'] as Period[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePeriod(p)}
                      className={`px-3 py-1 text-label-caps font-label-caps border transition-colors ${
                        activePeriod === p
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6 relative min-h-[300px]">
                <div className="w-full h-full border-l border-b border-outline-variant relative">
                  {['$1,000', '$960', '$920', '$880'].map((v, i) => (
                    <div
                      key={v}
                      className="absolute left-2 text-[10px] font-mono text-outline"
                      style={{ top: `${i * 25}%`, transform: 'translateY(-50%)' }}
                    >
                      {v}
                    </div>
                  ))}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 300">
                    <path d="M0,200 C50,180 100,160 150,140 S250,100 300,80 S400,50 500,30"
                      fill="none" stroke="#000000" strokeWidth="2" opacity="0.8" />
                    <path d="M0,250 C50,240 100,230 150,220 S250,200 300,210 S400,195 500,185"
                      fill="none" stroke="#74777d" strokeWidth="1.5" strokeDasharray="6 3" />
                    <circle cx="500" cy="30"  r="4" fill="#000000" />
                    <circle cx="500" cy="185" r="4" fill="#74777d" />
                  </svg>
                  <div className="absolute top-3 right-3 bg-surface border border-outline-variant p-2 font-mono text-[12px]">
                    <p className="text-primary">
                      Pt: {formatPrice(ptPrice?.priceUsd ?? null)}
                    </p>
                    <p className="text-secondary">
                      Pd: {formatPrice(pdPrice?.priceUsd ?? null)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LPPM Daily Fixing */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant flex flex-col">
              <div className="p-5 bg-primary text-on-primary">
                <h3 className="text-headline-sm font-headline-sm uppercase">LPPM Daily Fix</h3>
                <p className="text-body-sm opacity-80 mt-0.5">
                  Reference prices for global settlements
                </p>
                <p className="text-[10px] opacity-50 mt-1">Indicative — live LPPM data requires institutional access</p>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      {['Date', 'AM Fix', 'PM Fix'].map((h) => (
                        <th key={h} className="p-3 text-label-caps font-label-caps">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[13px]">
                    {FIXINGS.map((f, i) => (
                      <tr
                        key={f.date}
                        className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container/20' : ''}`}
                      >
                        <td className="p-3 text-[12px]">{f.date}</td>
                        <td className="p-3 font-bold">{f.am}</td>
                        <td className="p-3 font-bold">{f.pm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-outline-variant">
                <button className="w-full text-center text-label-caps font-label-caps text-primary hover:underline flex items-center justify-center gap-1">
                  View Full Historical Archives <TrendingUp size={12} />
                </button>
              </div>
            </div>

            {/* Market Volatility */}
            <motion.div
              className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant p-6"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-headline-sm font-headline-sm mb-5 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Market Volatility Outlook
              </h4>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-surface-container p-4 border-l-4 border-error">
                  <p className="text-label-caps font-label-caps text-secondary mb-1">Resistance Level</p>
                  <p className="font-mono text-[20px] font-bold">$965.00</p>
                </div>
                <div className="flex-1 bg-surface-container p-4 border-l-4 border-primary">
                  <p className="text-label-caps font-label-caps text-secondary mb-1">Support Level</p>
                  <p className="font-mono text-[20px] font-bold">$922.00</p>
                </div>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                PGM markets showing increased sensitivity to automotive manufacturing forecasts.
                Resistance at $965 remains untested as secondary markets absorb supply overhang
                from recent refinery clearing.
              </p>
            </motion.div>

            {/* Alert widget */}
            <motion.div
              className="col-span-12 md:col-span-6 bg-primary-container border border-outline-variant relative overflow-hidden group"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-transparent" />
              <div className="relative z-10 p-8 flex flex-col h-full justify-center min-h-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-primary-fixed-dim" />
                  <h4 className="text-headline-sm font-headline-sm text-on-primary uppercase tracking-wide">
                    Global Export Alert
                  </h4>
                </div>
                <p className="text-body-sm text-on-primary-container mb-5 max-w-xs leading-relaxed">
                  New compliance regulations for Rhodium transport effective Nov 1st.
                  Update your documentation sets via the portal.
                </p>
                <button className="self-start bg-on-primary text-primary px-4 py-2 text-label-caps font-label-caps hover:opacity-80 transition-opacity">
                  Review Regulation Changes
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
