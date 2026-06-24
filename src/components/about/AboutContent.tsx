'use client';

import { motion, type Variants } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { Globe, Download, ShieldCheck, Leaf, TrendingUp } from 'lucide-react';

const fadeUp: Variants   = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const fadeLeft: Variants = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } };
const fadeRight: Variants= { hidden: { opacity: 0, x: 40 },  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } };
const stagger: Variants  = { visible: { transition: { staggerChildren: 0.12 } } };
const cardAnim: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };


const dataTerminal = [
  { label: 'Supplier Network',   val: '50-60'  },
  { label: 'Buyer Network',      val: '100+'   },
  { label: 'Countries Served',   val: '3'      },
  { label: 'Compliance Rate',    val: '95%'    },
];

const envStats = [
  { value: '30%',    label: 'Fleet Emissions Reduction' },
  { value: '100%',   label: 'Recyclable Packaging'     },
  { value: 'Solar',  label: 'Powered Warehousing'      },
  { value: 'Tier 4', label: 'Engine Standard Fleet'    },
];

const bigStats = [
  { value: '10+',  label: 'Years of Operation' },
  { value: '60+',  label: 'Supplier Contacts'  },
  { value: '3',    label: 'Countries Served'   },
  { value: '95%',  label: 'Compliance Rate'    },
];

export default function AboutContent() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="lg:ml-[240px] w-full">
        <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-24">

          {/* ── Hero ── */}
          <div className="mb-24 grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeLeft}>
              <div className="inline-block px-2 py-1 bg-primary text-on-primary text-label-caps font-label-caps mb-4">ESTABLISHED 2016</div>
              <h1 className="text-headline-lg font-headline-lg text-primary mb-6 leading-tight">
                Global Precision In<br />Industrial Logistics
              </h1>
              <p className="text-body-lg text-secondary mb-8 leading-relaxed">
                Mayank Global Exports is a tier-one supplier of high-purity metals and critical industrial components. We bridge the gap between heavy manufacturing and global distribution with a focus on structural rigidity and logistical transparency.
              </p>
              <button className="bg-primary text-on-primary px-6 py-3 text-label-caps font-label-caps flex items-center gap-2 hover:opacity-80 transition-opacity">
                CORPORATE PROFILE <Download size={14} />
              </button>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeRight} className="relative">
              <div className="absolute -top-3 -left-3 w-full h-full border-2 border-secondary-container pointer-events-none" />
              <div className="w-full h-[340px] bg-primary-container flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #bac8dc 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="text-center relative z-10">
                  <Globe size={72} className="text-on-primary-container/30 mx-auto mb-4" />
                  <span className="font-mono text-[13px] text-on-primary-container">60+ CONTACTS · 3 COUNTRIES</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Big Stats Strip ── */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant border border-outline-variant mb-24"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          >
            {bigStats.map(({ value, label }) => (
              <motion.div key={label} variants={cardAnim} className="bg-surface-container-lowest p-8 text-center">
                <div className="font-mono text-[36px] font-bold text-primary leading-none mb-2">{value}</div>
                <div className="text-label-caps font-label-caps text-[10px] text-outline">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Logistics Infrastructure ── */}
          <motion.div
            className="mb-24"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
          >
            <h2 className="text-headline-md font-headline-md text-primary mb-1 border-l-4 border-primary pl-4 uppercase tracking-wide">
              Logistics Infrastructure
            </h2>
            <p className="text-body-md text-secondary mb-8 pl-5">Operating across India and abroad with a network of 60+ suppliers and 100+ buyers.</p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4"
              style={{ minHeight: 520 }}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            >
              <motion.div variants={cardAnim} className="md:col-span-2 bg-surface-container border border-outline-variant p-8 flex flex-col justify-between hover:border-primary transition-colors">
                <div>
                  <Globe size={36} className="text-primary mb-4" />
                  <h3 className="text-headline-sm font-headline-sm mb-2">Intercontinental Network</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">Our network spans across India with suppliers and buyers in 3 countries, enabling seamless sourcing and distribution of catalytic converters.</p>
                </div>
                <div className="mt-4 font-mono text-[13px] text-primary">SUPPLIERS: 60+ | BUYERS: 100+ | COUNTRIES: 3</div>
              </motion.div>

              <motion.div variants={cardAnim} className="md:row-span-2 bg-primary-container relative overflow-hidden flex flex-col justify-end p-6">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Globe size={140} className="text-on-primary-container" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-headline-sm font-headline-sm text-on-primary">Port Operations</h4>
                  <p className="text-label-caps font-label-caps text-on-primary-container opacity-80 uppercase tracking-widest mt-1">Global Maritime Strategy</p>
                </div>
              </motion.div>

              <motion.div variants={cardAnim} className="bg-primary text-on-primary p-8">
                <ShieldCheck size={36} className="mb-4 opacity-80" />
                <h3 className="text-headline-sm font-headline-sm mb-3">Export Capabilities</h3>
                <ul className="space-y-2 text-body-sm opacity-90">
                  <li>• Tier 1 Hazardous Logistics</li>
                  <li>• Temperature-Controlled Foils</li>
                  <li>• Customs Clearance Automation</li>
                  <li>• Cross-border documentation</li>
                </ul>
              </motion.div>

              <motion.div variants={cardAnim} className="bg-surface-container-high border border-outline-variant p-8">
                <h3 className="text-label-caps font-label-caps mb-5 text-primary">DATA TERMINAL</h3>
                <div className="space-y-3">
                  {dataTerminal.map(({ label, val }) => (
                    <div key={label} className="flex justify-between border-b border-outline-variant pb-2">
                      <span className="text-body-sm text-on-surface-variant">{label}</span>
                      <span className="font-mono text-[13px] font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Sustainability ── */}
          <motion.div
            className="mb-24"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
          >
            <div className="border-4 border-primary p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Leaf size={140} />
              </div>
              <div className="max-w-3xl relative z-10">
                <div className="text-label-caps font-label-caps text-primary mb-4">ENVIRONMENTAL STEWARDSHIP</div>
                <h3 className="text-headline-lg font-headline-lg mb-6">Commitment to Circular Industrial Value Chains</h3>
                <p className="text-body-lg text-secondary mb-10">Mayank Global Exports actively invests in carbon-neutral logistics and closed-loop metal recycling programs to minimize ecological footprint.</p>
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-outline-variant"
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                >
                  {envStats.map(({ value, label }) => (
                    <motion.div key={label} variants={cardAnim}>
                      <div className="text-headline-md font-headline-md font-bold mb-1">{value}</div>
                      <div className="text-body-sm text-on-surface-variant">{label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── Contact ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <motion.div variants={cardAnim} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-surface-container border border-outline-variant p-8 hover:border-primary transition-colors max-w-lg">
              <h3 className="text-headline-sm font-headline-sm mb-2">New Delhi HQ</h3>
              <p className="text-body-md text-on-surface-variant mb-4">New Delhi, India</p>
              <div className="font-mono text-[13px] text-secondary mb-1">+91 9331668029</div>
              <div className="font-mono text-[13px] text-secondary">manojsahu@mayankglobalexports.com</div>
              <div className="font-mono text-[13px] text-secondary mt-1">bijaygupta@mayankglobalexports.com</div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
