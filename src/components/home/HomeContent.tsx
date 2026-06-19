'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, TrendingUp, Globe, BarChart3, ChevronRight, Zap } from 'lucide-react';
import PGMChart from './PGMChart';
import CatalogSearchBox from '@/components/search/CatalogSearchBox';

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

interface TickerItem { symbol: string; name: string; price: string; chg: string; neg: boolean | null; }

function useLiveTicker(): TickerItem[] {
  const [items, setItems] = useState<TickerItem[]>([
    { symbol: 'Pt', name: 'PLATINUM',  price: '—',   chg: '—', neg: null },
    { symbol: 'Pd', name: 'PALLADIUM', price: '—',   chg: '—', neg: null },
    { symbol: 'Rh', name: 'RHODIUM',   price: 'OTC', chg: '—', neg: null },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/v1/metals/prices');
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
  }, []);

  return items;
}

const heroStats = [
  { value: '12,408', label: 'Verified Codes'  },
  { value: '$4.2B',  label: 'Annual Volume'   },
  { value: '42,891', label: 'Active Traders'  },
  { value: '99.8%',  label: 'Compliance Rate' },
];

const steps = [
  { num: '01', title: 'Identify & Search', desc: 'Enter any OEM or aftermarket code. Instant PGM analysis, weight data, and live market value across 12,408 verified units.' },
  { num: '02', title: 'Compare & Bid',    desc: 'Browse verified seller listings with real-time Pt/Pd/Rh overlays. Submit bids or request direct quotes within the platform.' },
  { num: '03', title: 'Settle & Ship',    desc: 'Automated customs documentation, AEO-certified logistics, and escrow-protected payments. Funds cleared in 2 business days.' },
];

const hotListings = [
  { code: 'CER-V2-882',  type: 'Ceramic',            origin: 'Nagoya, JP',  pt: '1.48g', pd: '0.91g', rh: '0.14g', price: '$839.00',   trend: '+2.1%', pos: true  },
  { code: 'MET-F4-441',  type: 'Metallic Foil',      origin: 'Duisburg, DE',pt: '2.10g', pd: '1.32g', rh: '0.22g', price: '$912.50',   trend: '+1.8%', pos: true  },
  { code: 'DPF-EU6-441', type: 'Diesel Particulate', origin: 'Munich, DE',  pt: '0.88g', pd: '0.54g', rh: '0.09g', price: '$481.00',   trend: '-0.4%', pos: false },
  { code: 'PLT-G3-110',  type: 'Metallic Foil',      origin: 'Zürich, CH',  pt: '3.22g', pd: '1.98g', rh: '0.31g', price: '$1,642.00', trend: '+3.0%', pos: true  },
];

const trustedBy = ['BMW Group', 'Toyota Motor', 'Ford Motor', 'Volkswagen AG', 'Mercedes-Benz', 'Honda Motor'];

const sellerFeatures = [
  { icon: ShieldCheck, text: 'XRF-verified PGM assay reports included'  },
  { icon: Globe,       text: 'AEO-certified cross-border shipping'       },
  { icon: BarChart3,   text: 'Live Pt/Pd/Rh market pricing overlays'    },
  { icon: TrendingUp,  text: 'Avg. 14-day time-to-settlement'           },
];

const platformStats = [
  { value: '14.2 Days', label: 'Avg Transit Time', sub: 'Door-to-door'        },
  { value: '8,200+',    label: 'Verified Sellers',  sub: 'KYC & AML cleared'  },
  { value: '< 0.4%',   label: 'Dispute Rate',       sub: 'Industry leading'   },
  { value: '340+',      label: 'Daily Settlements', sub: 'Across 48 countries' },
];

export default function HomeContent() {
  const pgmTicker = useLiveTicker();

  return (
    <div className="bg-surface overflow-x-hidden">

      {/* ── Hero ── */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Layered dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85" />
        {/* Subtle dot grid on top */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 page-container py-24 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 px-4 py-1.5 text-label-caps font-label-caps text-white mb-8"
          >
            <ShieldCheck size={12} />
            INSTITUTIONAL GRADE METALS EXCHANGE
          </motion.div>

          {/* Headline */}
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
            Real-time PGM pricing. Verified seller profiles. Automated export documentation.
          </motion.p>

          {/* Glass search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-12"
          >
            <CatalogSearchBox variant="hero" />
          </motion.div>

          {/* Stat badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {heroStats.map(({ value, label }) => (
              <div key={label} className="backdrop-blur-sm bg-black/30 border border-white/15 px-5 py-3 text-center">
                <div className="font-mono text-[22px] font-bold text-white leading-none">{value}</div>
                <div className="text-label-caps font-label-caps text-white/60 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Glass CTA pair */}
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

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
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

      {/* ── Trusted By ── */}
      <section className="bg-surface-container-low border-b border-outline-variant py-10">
        <motion.div
          className="page-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <p className="text-center text-label-caps font-label-caps text-outline mb-6">RECOGNIZED BY GLOBAL MANUFACTURERS</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40">
            {trustedBy.map((name) => (
              <span key={name} className="font-bold text-body-md text-on-surface">{name}</span>
            ))}
          </div>
        </motion.div>
      </section>

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
          <h2 className="text-headline-lg font-headline-lg text-primary mb-4">From Identification to Settlement</h2>
          <p className="text-body-lg text-secondary max-w-xl mx-auto">Three steps. Two business days. Zero paperwork bottlenecks.</p>
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

      {/* ── Hot Listings ── */}
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
              <div className="text-label-caps font-label-caps text-primary-fixed-dim mb-2">MARKETPLACE</div>
              <h2 className="text-headline-lg font-headline-lg text-on-primary">Hot Listings Today</h2>
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
            {hotListings.map((item, i) => (
              <motion.div
                key={item.code}
                variants={{
                  hidden:  { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Link
                  href={`/catalog/${item.code}`}
                  className="bg-surface-container-lowest border border-outline-variant p-5 hover:border-primary-fixed-dim transition-colors group block h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-surface-container text-on-surface-variant text-label-caps font-label-caps text-[10px] px-2 py-1 border border-outline-variant">{item.type}</span>
                    <span className={`text-label-caps font-label-caps text-[10px] font-bold ${item.pos ? 'text-green-600' : 'text-red-600'}`}>{item.trend}</span>
                  </div>
                  <div className="font-mono text-[18px] font-bold text-primary mb-1">{item.code}</div>
                  <div className="text-label-caps font-label-caps text-[10px] text-outline mb-4 flex items-center gap-1">
                    <Globe size={9} /> {item.origin}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{ label: 'Pt', val: item.pt }, { label: 'Pd', val: item.pd }, { label: 'Rh', val: item.rh }].map(({ label, val }) => (
                      <div key={label} className="bg-surface-container p-2 text-center">
                        <div className="text-label-caps font-label-caps text-[9px] text-outline">{label}</div>
                        <div className="font-mono text-[11px] font-bold">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant pt-3">
                    <span className="font-mono text-[20px] font-bold">{item.price}</span>
                    <span className="text-label-caps font-label-caps text-[10px] text-primary border border-primary px-2 py-1 group-hover:bg-primary group-hover:text-on-primary transition-all">QUOTE</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── For Sellers ── */}
      <section className="py-24 border-b border-outline-variant">
        <div className="page-container grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="text-label-caps font-label-caps text-secondary mb-3">FOR SELLERS</div>
            <h2 className="text-headline-lg font-headline-lg text-primary mb-5">Reach 42,000+ Verified Institutional Buyers</h2>
            <p className="text-body-lg text-secondary mb-8 leading-relaxed">
              List your inventory with full PGM analysis, compliance documentation, and live pricing overlays. Screened buyers across 48 countries.
            </p>
            <motion.div className="space-y-4 mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {sellerFeatures.map(({ icon: Icon, text }) => (
                <motion.div key={text} variants={cardFade} className="flex items-center gap-3">
                  <Icon size={16} className="text-primary shrink-0" />
                  <span className="text-body-md text-on-surface-variant">{text}</span>
                </motion.div>
              ))}
            </motion.div>
            <Link href="/login" className="bg-primary text-on-primary text-label-caps font-label-caps px-8 py-4 inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              START SELLING <ArrowRight size={14} />
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
              <span className="text-label-caps font-label-caps opacity-70">SELLER DASHBOARD — LIVE</span>
              <span className="flex items-center gap-1.5 text-label-caps font-label-caps text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> ACTIVE
              </span>
            </div>
            <div className="p-5 space-y-2">
              {[
                { code: 'CER-V2-882', bids: 7, price: '$839.00',   status: 'Active'  },
                { code: 'MET-F4-441', bids: 3, price: '$912.50',   status: 'Active'  },
                { code: 'PLT-G3-110', bids: 0, price: '$1,642.00', status: 'Pending' },
              ].map(({ code, bids, price, status }) => (
                <div key={code} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
                  <div>
                    <div className="font-mono text-[13px] font-bold text-primary">{code}</div>
                    <div className="text-label-caps font-label-caps text-[10px] text-outline mt-0.5">{bids} active bids</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[15px] font-bold">{price}</div>
                    <span className={`text-label-caps font-label-caps text-[10px] ${status === 'Active' ? 'text-green-700' : 'text-outline'}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 grid grid-cols-3 gap-2">
                {[{ label: 'Vol. YTD', val: '$4.28M' }, { label: 'Settled', val: '94' }, { label: 'Rating', val: '98.2%' }].map(({ label, val }) => (
                  <div key={label} className="bg-surface-container p-3 text-center border border-outline-variant">
                    <div className="text-label-caps font-label-caps text-[9px] text-outline">{label}</div>
                    <div className="font-mono text-[13px] font-bold mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Platform Stats ── */}
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
              <motion.div key={label} variants={cardFade} className="bg-surface-container-lowest p-8 text-center">
                <div className="font-mono text-[34px] font-bold text-primary leading-none mb-2">{value}</div>
                <div className="text-body-sm font-semibold text-on-surface mb-1">{label}</div>
                <div className="text-label-caps font-label-caps text-[10px] text-outline">{sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

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
              Join the World&apos;s Most Trusted Industrial Metals Exchange
            </h2>
            <p className="text-body-lg text-on-primary-container mb-10 leading-relaxed">
              Free to register. Verified within 24 hours. Access to 12,408 product codes and live PGM pricing from day one.
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
