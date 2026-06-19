'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Star, Send, ShieldCheck } from 'lucide-react';

const stagger: Variants  = { visible: { transition: { staggerChildren: 0.1 } } };
const cardAnim: Variants = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const reviews = [
  {
    id: 'RE-902341',
    stars: 5,
    role: 'Buyer',
    quote: '"The transparency in metal purity reports is unparalleled. We\'ve optimized our procurement cycle by 22% since migrating our trade desk to the MGE platform."',
    name: 'Robert Chen',
    title: 'Metals Director, Aurum Corp',
    country: 'SG',
  },
  {
    id: 'RE-901122',
    stars: 5,
    role: 'Seller',
    quote: '"Reliability is the only currency that matters in high-volume trading. Mayank Global provides a rigorous verification layer that eliminates counterparty risk entirely."',
    name: 'Elena Volkova',
    title: 'Logistics VP, Nord-Plat',
    country: 'CH',
  },
  {
    id: 'RE-899450',
    stars: 4,
    role: 'Buyer',
    quote: '"The marketplace interface is like a financial terminal—precise and data-dense. Support is exceptional, especially during high-volatility sessions."',
    name: 'Jameson Thorne',
    title: 'Senior Trader, Apex Assets',
    country: 'GB',
  },
  {
    id: 'RE-897210',
    stars: 5,
    role: 'Seller',
    quote: '"We have traded across 12 different platforms. Nothing comes close to the institutional transparency of MGE. It is the Bloomberg of scrap metal."',
    name: 'Haruto Tanaka',
    title: 'Director, Shinwa Metals KK',
    country: 'JP',
  },
  {
    id: 'RE-895009',
    stars: 5,
    role: 'Buyer',
    quote: '"Compliance documentation, real-time pricing, and verified seller profiles in one place. We closed our largest procurement round in under 48 hours."',
    name: 'Priya Agarwal',
    title: 'Procurement Head, IndusMetals',
    country: 'IN',
  },
  {
    id: 'RE-892312',
    stars: 5,
    role: 'Seller',
    quote: '"The automated customs documentation alone saves us 20 hours per shipment. MGE has fundamentally changed how we run cross-border trade."',
    name: 'Klaus Bauer',
    title: 'Export Manager, EuroAlloys GmbH',
    country: 'DE',
  },
];

const countryFlags: Record<string, string> = {
  SG: '🇸🇬', CH: '🇨🇭', GB: '🇬🇧', JP: '🇯🇵', IN: '🇮🇳', DE: '🇩🇪',
};

export default function ReviewsPage() {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <section className="bg-primary-container py-14 border-b border-outline/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="page-container flex flex-col items-center text-center relative z-10">
          <h1 className="text-headline-lg font-headline-lg text-on-primary mb-6 uppercase tracking-tight">
            Trusted by B2B Traders Worldwide
          </h1>
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[1,2,3,4].map((i) => (
                <Star key={i} size={32} className="text-primary-fixed-dim fill-primary-fixed-dim" />
              ))}
              <Star size={32} className="text-primary-fixed-dim" style={{ clipPath: 'inset(0 50% 0 0)', fill: '#bac8dc' }} />
            </div>
            <div className="text-primary-fixed-dim font-bold text-[24px]">4.9 / 5.0</div>
            <div className="text-label-caps font-label-caps text-on-primary-container uppercase tracking-widest">
              Based on 12,450+ Institutional Inspections
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="bg-surface-container-lowest border-b border-outline-variant py-5">
        <div className="page-container grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 border-r border-outline-variant pr-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-label-caps font-label-caps text-on-surface-variant">GLOBAL TRADER COUNT</span>
              <span className="font-mono text-[13px] font-bold text-primary">42,891</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5">
              <div className="bg-primary h-full" style={{ width: '88%' }} />
            </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: '5 Stars', pct: '92%', w: '92%' },
              { label: '4 Stars', pct: '6%',  w: '6%'  },
              { label: '3 Stars', pct: '1%',  w: '1%'  },
            ].map(({ label, pct, w }) => (
              <div key={label} className="flex flex-col">
                <span className="text-label-caps font-label-caps text-outline mb-1">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-surface-container-highest h-1.5">
                    <div className="bg-primary h-full" style={{ width: w }} />
                  </div>
                  <span className="font-mono text-[11px]">{pct}</span>
                </div>
              </div>
            ))}
            <div>
              <span className="text-label-caps font-label-caps text-outline">Verified</span>
              <div className="text-headline-sm font-semibold mt-1">99.8%</div>
            </div>
            <div>
              <span className="text-label-caps font-label-caps text-outline">SLA Score</span>
              <div className="text-headline-sm font-semibold mt-1">A+</div>
            </div>
          </div>
        </div>
      </section>

      {/* Review grid */}
      <section className="py-16 page-container">
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
          {reviews.map((r) => (
            <motion.div key={r.id} variants={cardAnim} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="bg-surface-container-lowest border border-outline-variant accent-left p-6 hover:shadow-lg transition-shadow flex flex-col hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i <= r.stars ? 'text-primary-fixed-dim fill-primary-fixed-dim' : 'text-outline-variant'}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-outline">ID: #{r.id}</span>
                </div>
                <span className={`text-label-caps font-label-caps text-[10px] px-2 py-1 ${
                  r.role === 'Buyer' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
                }`}>
                  {r.role}
                </span>
              </div>

              <p className="italic text-body-md text-on-surface-variant mb-6 leading-relaxed flex-1">{r.quote}</p>

              <div className="flex items-center justify-between border-t border-outline-variant pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-primary-container">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[13px] uppercase">{r.name}</h4>
                    <p className="text-label-caps font-label-caps text-[10px] text-outline">{r.title}</p>
                  </div>
                </div>
                <span className="text-[20px]">{countryFlags[r.country]}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <button className="border border-primary px-8 py-3 text-label-caps font-label-caps hover:bg-primary hover:text-on-primary transition-all">
            LOAD ARCHIVE RECORDS
          </button>
        </div>
      </section>

      {/* Review form */}
      <section className="bg-surface-container py-16 border-t border-outline-variant">
        <div className="max-w-2xl mx-auto px-margin-mobile md:px-0">
          <div className="text-center mb-10">
            <h2 className="text-headline-md font-headline-md uppercase mb-2">Share Your Experience</h2>
            <p className="text-on-surface-variant text-body-md">Your feedback strengthens the security and integrity of the global metals exchange.</p>
          </div>

          <form className="space-y-6 bg-surface-container-lowest border border-outline-variant p-8 shadow-sm" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-label-caps font-label-caps text-outline mb-1.5">FULL NAME</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-surface border border-outline-variant px-4 py-3 font-mono text-[13px] placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-outline mb-1.5">ORGANIZATION</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full bg-surface border border-outline-variant px-4 py-3 font-mono text-[13px] placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-label-caps font-label-caps text-outline mb-1.5">RATING</label>
              <div className="flex gap-2 p-3 border border-outline-variant bg-surface items-center">
                {[1,2,3,4,5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(i)}
                    className="focus:outline-none"
                    aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={28}
                      className={
                        i <= (hovered || rating)
                          ? 'text-primary-fixed-dim fill-primary-fixed-dim'
                          : 'text-outline-variant'
                      }
                    />
                  </button>
                ))}
                <span className="ml-auto font-mono text-[11px] text-outline">
                  {rating > 0 ? `${rating} / 5` : 'Select Stars'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-label-caps font-label-caps text-outline mb-1.5">OFFICIAL STATEMENT</label>
              <textarea
                rows={4}
                placeholder="Describe platform reliability, inspection accuracy, and counterparty performance..."
                className="w-full bg-surface border border-outline-variant px-4 py-3 text-body-md placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="authorize" className="w-4 h-4 mt-0.5 border-outline-variant text-primary focus:ring-0 rounded-none shrink-0" />
              <label htmlFor="authorize" className="text-[10px] font-label-caps text-outline uppercase select-none">
                I authorize the publication of this review for institutional verification purposes.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary text-label-caps font-label-caps py-4 tracking-widest hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
              <Send size={14} /> SUBMIT INSPECTION LOG
            </button>

            <div className="flex items-center justify-center gap-2 text-label-caps font-label-caps text-on-surface-variant">
              <ShieldCheck size={12} />
              All reviews are cryptographically signed and tamper-proof
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
