'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, TrendingUp, Globe, BarChart3, ChevronRight, Zap, Search, DollarSign, Send } from 'lucide-react';
import PGMChart from './PGMChart';
import CatalogSearchBox from '@/components/search/CatalogSearchBox';
import { useAuth } from '@/context/AuthContext';

const HERO_IMAGE = '/hero-metal.jpg';

const fadeUp: import('framer-motion').Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger: import('framer-motion').Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardFade: import('framer-motion').Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Types ──────────────────────────────────────────────────────────────────

interface TickerItem { symbol: string; name: string; price: string; chg: string; neg: boolean | null; }
interface PlatformStats { catalogEntryCount: number; entriesWithPpmCount: number; manufacturerCount: number; userCount: number; }
interface FeaturedEntry {
  id: number; primaryCode: string; manufacturer: string; manufacturerBrand: string | null;
  catalystType: string; region: string | null;
  ptPpm: number | null; pdPpm: number | null; rhPpm: number | null;
  valuation?: { perKg?: { usd: number }; perPiece?: { usd: number; weightGrams?: number } } | null;
}

const TYPE_LABELS: Record<string, string> = {
  CERAMIC: 'Ceramic', DPF: 'DPF', CERAMIC_DPF: 'Ceramic+DPF',
  FOIL: 'Foil', SET: 'Set', STEEL: 'Steel', OTHER: 'Other',
};

// ── Hooks ──────────────────────────────────────────────────────────────────

function useLiveTicker(): TickerItem[] {
  const { authFetch } = useAuth();
  const [items, setItems] = useState<TickerItem[]>([
    { symbol: 'Pt', name: 'PLATINUM',  price: '—',   chg: '—', neg: null },
    { symbol: 'Pd', name: 'PALLADIUM', price: '—',   chg: '—', neg: null },
    { symbol: 'Rh', name: 'RHODIUM',   price: 'OTC', chg: '—', neg: null },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const res  = await authFetch('/api/v1/metals/prices');
        const body = await res.json();
        if (!body.success || !body.data?.prices) return;

        setItems(body.data.prices.map((m: any) => ({
          symbol: m.displaySymbol,
          name:   m.name,
          price:  m.live && m.priceUsd != null
            ? '$' + m.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'OTC',
          chg:  m.live && m.changePct != null
            ? (m.changePct > 0 ? '+' : '') + m.changePct.toFixed(2) + '%'
            : '—',
          neg: m.live && m.changePct != null
            ? m.changePct < 0
            : null,
        })));
      } catch {}
    }

    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [authFetch]);

  return items;
}

function useHomeData() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [featured, setFeatured] = useState<FeaturedEntry[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);

  useEffect(() => {
    authFetch('/api/v1/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => setStats(body.data ?? body))
      .catch(() => {});

    authFetch('/api/v1/catalog/featured?count=4')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => setFeatured(body.data ?? body))
      .catch(() => {});

    authFetch('/api/v1/catalog/manufacturers')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => setManufacturers(body.data ?? body))
      .catch(() => {});
  }, [authFetch]);

  return { stats, featured, manufacturers };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function HomeContent() {
  const { user } = useAuth();
  const canViewPgm = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const pgmTicker = useLiveTicker();
  const { stats, featured, manufacturers } = useHomeData();

  const heroStats = stats ? [
    { value: stats.catalogEntryCount.toLocaleString(), label: 'Catalog Entries' },
    { value: stats.entriesWithPpmCount.toLocaleString(), label: 'With PGM Data' },
    { value: stats.manufacturerCount.toLocaleString(), label: 'Manufacturers' },
    { value: stats.userCount.toLocaleString(), label: 'Registered Users' },
  ] : [];

  const steps = [
    { num: '01', title: 'Search the Catalog', desc: `Enter any OEM or aftermarket code. Instant access to ${stats?.catalogEntryCount?.toLocaleString() ?? '11,000+'} verified entries with manufacturer, type, and region data.` },
    { num: '02', title: 'Check Live Valuations', desc: 'View real-time Pt/Pd/Rh valuations based on LBMA spot prices. Adjust PPM and weight inputs to see per-gram, per-kg, and per-piece pricing instantly.' },
    { num: '03', title: 'Request a Quote', desc: 'Submit a quote request directly from any catalog entry page. Our team responds within 2 business hours with competitive pricing.' },
  ];

  const platformFeatures = [
    { icon: Search,      text: `${stats?.catalogEntryCount?.toLocaleString() ?? '11,000+'} searchable catalog entries` },
    { icon: BarChart3,   text: 'Per-entry PGM analysis with PPM data' },
    { icon: DollarSign,  text: 'Live Pt/Pd/Rh spot price tracking' },
    { icon: TrendingUp,  text: 'Instant per-gram, per-kg, and per-piece valuations' },
  ];

  const platformStats = stats ? [
    { value: stats.catalogEntryCount.toLocaleString(), label: 'Catalog Entries', sub: 'Searchable database' },
    { value: stats.entriesWithPpmCount.toLocaleString(), label: 'With PGM Data', sub: 'Pt/Pd/Rh PPM values' },
    { value: stats.manufacturerCount.toLocaleString(), label: 'Manufacturers', sub: 'Global coverage' },
    { value: stats.userCount.toLocaleString(), label: 'Registered Users', sub: 'Growing community' },
  ] : [];

  const topBrands = manufacturers.slice(0, 6);

  return (
    <div className="bg-surface overflow-x-hidden">

      {/* ── Hero ── */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 page-container py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 px-4 py-1.5 text-label-caps font-label-caps text-white mb-8"
          >
            <ShieldCheck size={12} />
            PGM METALS EXCHANGE PLATFORM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(36px,6vw,68px)] font-bold leading-[1.08] tracking-tight text-white max-w-4xl mx-auto mb-5"
          >
            The World&apos;s Most Trusted<br />
            <span className="text-primary-fixed-dim">Catalytic Converter</span> Exchange
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-body-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Real-time PGM pricing. Verified catalog data. Instant valuations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-12"
          >
            <CatalogSearchBox variant="hero" />
          </motion.div>

          {heroStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {heroStats.map(({ value, label }) => (
                <div key={label} className="backdrop-blur-sm bg-black/30 border border-white/15 px-3 sm:px-5 py-2 sm:py-3 text-center">
                  <div className="font-mono text-[22px] font-bold text-white leading-none">{value}</div>
                  <div className="text-label-caps font-label-caps text-white/60 mt-1">{label}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
          >
            <Link href="/catalog" className="backdrop-blur-md bg-white/15 border border-white/30 text-white text-label-caps font-label-caps px-8 py-3 hover:bg-white/25 transition-colors inline-flex items-center justify-center gap-2">
              BROWSE CATALOG <ChevronRight size={14} />
            </Link>
            <Link href="/login" className="backdrop-blur-md bg-white/5 border border-white/20 text-white/80 text-label-caps font-label-caps px-8 py-3 hover:bg-white/15 transition-colors inline-flex items-center justify-center gap-2">
              CREATE ACCOUNT <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
        >
          <span className="text-label-caps font-label-caps text-white/40 text-[10px]">SCROLL TO EXPLORE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Live PGM Ticker ── */}
      <section className="bg-primary-container border-b border-white/10 py-3 overflow-hidden">
        <div className="page-container">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="text-label-caps font-label-caps text-on-primary-container opacity-60 whitespace-nowrap shrink-0 flex items-center gap-1.5">
              <Zap size={11} className="text-primary-fixed-dim" /> LIVE PGM
            </span>
            {pgmTicker.map(({ symbol, name, price, chg, neg }) => (
              <div key={symbol} className="flex items-center gap-3 whitespace-nowrap shrink-0 border-l border-white/10 pl-6">
                <span className="font-mono text-[12px] font-bold text-primary-fixed-dim">{symbol}</span>
                <span className="text-label-caps font-label-caps text-on-primary-container opacity-50 hidden sm:inline">{name}</span>
                <span className="font-mono text-[13px] font-bold text-on-primary">{price}</span>
                <span className={`font-mono text-[11px] font-bold ${neg === false ? 'text-green-400' : neg === true ? 'text-red-400' : 'text-on-primary-container'}`}>{chg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PGM Chart ── */}
      <section className="bg-primary-container py-12">
        <motion.div
          className="page-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-label-caps font-label-caps text-primary-fixed-dim mb-1">MARKET DATA</div>
              <h2 className="text-headline-md font-headline-md text-on-primary">Precious Metals Index</h2>
            </div>
            <Link href="/metals-pricing" className="text-label-caps font-label-caps text-primary-fixed-dim hover:text-on-primary transition-colors flex items-center gap-1 text-[11px]">
              Full Terminal <ChevronRight size={12} />
            </Link>
          </div>
          <PGMChart />
        </motion.div>
      </section>

      {/* ── Manufacturers in Catalog ── */}
      {topBrands.length > 0 && (
        <section className="bg-surface-container-low border-b border-outline-variant py-10">
          <motion.div
            className="page-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-center text-label-caps font-label-caps text-outline mb-6">MANUFACTURERS IN OUR CATALOG</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40">
              {topBrands.map((name) => (
                <span key={name} className="font-bold text-body-md text-on-surface">{name}</span>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="py-24 page-container">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <div className="text-label-caps font-label-caps text-secondary mb-3">THE PROCESS</div>
          <h2 className="text-headline-lg font-headline-lg text-primary mb-4">From Search to Quote</h2>
          <p className="text-body-lg text-secondary max-w-xl mx-auto">Three steps to get competitive pricing on any catalytic converter.</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          {steps.map(({ num, title, desc }) => (
            <motion.div
              key={num}
              variants={cardFade}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-surface-container-lowest border border-outline-variant p-8 relative overflow-hidden group hover:border-primary transition-colors cursor-default"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
              <div className="text-[72px] font-bold font-mono text-outline/15 leading-none mb-6 select-none">{num}</div>
              <h3 className="text-headline-sm font-headline-sm text-primary mb-3">{title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Featured Entries ── */}
      {featured.length > 0 && (
        <section className="bg-primary-container py-20">
          <div className="page-container">
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div>
                <div className="text-label-caps font-label-caps text-primary-fixed-dim mb-2">CATALOG</div>
                <h2 className="text-headline-lg font-headline-lg text-on-primary">Featured Entries</h2>
              </div>
              <Link href="/catalog" className="flex items-center gap-2 text-label-caps font-label-caps text-primary-fixed-dim hover:text-on-primary transition-colors">
                Full Catalog <ChevronRight size={14} />
              </Link>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              {featured.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  variants={{
                    hidden:  { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                  }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Link
                    href={`/catalog/${entry.id}`}
                    className="bg-surface-container-lowest border border-outline-variant p-5 hover:border-primary-fixed-dim transition-colors group block h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-surface-container text-on-surface-variant text-label-caps font-label-caps text-[10px] px-2 py-1 border border-outline-variant">
                        {TYPE_LABELS[entry.catalystType] ?? entry.catalystType}
                      </span>
                      {entry.region && (
                        <span className="text-label-caps font-label-caps text-[10px] text-outline flex items-center gap-1">
                          <Globe size={9} /> {entry.region}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[18px] font-bold text-primary mb-1">{entry.primaryCode}</div>
                    <div className="text-label-caps font-label-caps text-[10px] text-outline mb-4">
                      {entry.manufacturerBrand ?? entry.manufacturer}
                    </div>
                    {canViewPgm ? (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'Pt', val: entry.ptPpm },
                          { label: 'Pd', val: entry.pdPpm },
                          { label: 'Rh', val: entry.rhPpm },
                        ].map(({ label, val }) => (
                          <div key={label} className="bg-surface-container p-2 text-center">
                            <div className="text-label-caps font-label-caps text-[9px] text-outline">{label}</div>
                            <div className="font-mono text-[11px] font-bold">{val != null ? `${val}` : '—'}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-4 bg-surface-container p-2 text-center">
                        <div className="font-mono text-[13px] font-bold">
                          {entry.valuation?.perKg?.usd
                            ? `$${entry.valuation.perKg.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}/kg`
                            : '—'}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-outline-variant pt-3">
                      <span className="font-mono text-[11px] text-outline">
                        {entry.valuation?.perKg?.usd
                          ? `$${entry.valuation.perKg.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}/kg`
                          : 'PPM data'}
                      </span>
                      <span className="text-label-caps font-label-caps text-[10px] text-primary border border-primary px-2 py-1 group-hover:bg-primary group-hover:text-on-primary transition-all">VIEW</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Platform Features ── */}
      <section className="py-24 border-b border-outline-variant">
        <div className="page-container grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="text-label-caps font-label-caps text-secondary mb-3">FOR BUSINESSES</div>
            <h2 className="text-headline-lg font-headline-lg text-primary mb-5">
              Simplify Your Catalytic Converter Sourcing
            </h2>
            <p className="text-body-lg text-secondary mb-8 leading-relaxed">
              Search our catalog, check live PGM valuations, and request quotes — all in one platform.
              {stats ? ` ${stats.userCount.toLocaleString()} users and growing.` : ''}
            </p>
            <motion.div className="space-y-4 mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {platformFeatures.map(({ icon: Icon, text }) => (
                <motion.div key={text} variants={cardFade} className="flex items-center gap-3">
                  <Icon size={16} className="text-primary shrink-0" />
                  <span className="text-body-md text-on-surface-variant">{text}</span>
                </motion.div>
              ))}
            </motion.div>
            <Link href="/catalog" className="bg-primary text-on-primary text-label-caps font-label-caps px-8 py-4 inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              BROWSE CATALOG <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-xl"
          >
            <div className="bg-primary text-on-primary px-5 py-3 flex items-center justify-between">
              <span className="text-label-caps font-label-caps opacity-70">PLATFORM OVERVIEW</span>
              <span className="flex items-center gap-1.5 text-label-caps font-label-caps text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="p-5 space-y-2">
              {(stats ? [
                { label: 'Total Catalog Entries', value: stats.catalogEntryCount.toLocaleString() },
                { label: 'Entries with PGM Data', value: stats.entriesWithPpmCount.toLocaleString() },
                { label: 'Manufacturers Covered', value: stats.manufacturerCount.toLocaleString() },
                { label: 'Registered Users', value: stats.userCount.toLocaleString() },
              ] : []).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
                  <span className="text-label-caps font-label-caps text-[11px] text-on-surface-variant">{label}</span>
                  <span className="font-mono text-[15px] font-bold">{value}</span>
                </div>
              ))}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {pgmTicker.map(({ symbol, price }) => (
                  <div key={symbol} className="bg-surface-container p-3 text-center border border-outline-variant">
                    <div className="text-label-caps font-label-caps text-[9px] text-outline">{symbol}</div>
                    <div className="font-mono text-[13px] font-bold mt-1">{price}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Platform Stats ── */}
      {platformStats.length > 0 && (
        <section className="bg-surface-container py-16">
          <motion.div
            className="page-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant border border-outline-variant">
              {platformStats.map(({ value, label, sub }) => (
                <motion.div key={label} variants={cardFade} className="bg-surface-container-lowest p-4 md:p-8 text-center">
                  <div className="font-mono text-[34px] font-bold text-primary leading-none mb-2">{value}</div>
                  <div className="text-body-sm font-semibold text-on-surface mb-1">{label}</div>
                  <div className="text-label-caps font-label-caps text-[10px] text-outline">{sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="bg-primary-container py-20">
        <motion.div
          className="page-container text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-label-caps font-label-caps text-primary-fixed-dim mb-4">GET STARTED TODAY</div>
            <h2 className="text-headline-lg font-headline-lg text-on-primary mb-6">
              Join the Catalytic Converter Exchange
            </h2>
            <p className="text-body-lg text-on-primary-container mb-10 leading-relaxed">
              Free to register. Access to {stats?.catalogEntryCount?.toLocaleString() ?? '11,000+'} catalog entries and live PGM pricing from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="bg-on-primary text-primary text-label-caps font-label-caps px-8 py-4 hover:opacity-80 transition-opacity inline-flex items-center justify-center gap-2">
                CREATE ACCOUNT <ArrowRight size={14} />
              </Link>
              <Link href="/catalog" className="backdrop-blur-sm bg-white/10 border border-white/25 text-on-primary text-label-caps font-label-caps px-8 py-4 hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
                BROWSE CATALOG
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
