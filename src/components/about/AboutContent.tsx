'use client';

import { motion, type Variants } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { Globe, Download, ShieldCheck, Leaf, TrendingUp } from 'lucide-react';

const fadeUp: Variants   = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const fadeLeft: Variants = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } };
const fadeRight: Variants= { hidden: { opacity: 0, x: 40 },  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } };
const stagger: Variants  = { visible: { transition: { staggerChildren: 0.12 } } };
const cardAnim: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const certifications = [
  { num: '01', title: 'ISO 9001:2015 COMPLIANCE',  desc: 'Strict adherence to Quality Management Systems across all export nodes.' },
  { num: '02', title: 'METALLURGICAL ANALYSIS',    desc: 'On-site spectroscopy and stress-testing for all industrial foil shipments.' },
  { num: '03', title: 'REACH & ROHS VERIFIED',     desc: 'Full chemical documentation for hazardous material handling and safety.' },
  { num: '04', title: 'AEO CERTIFIED OPERATOR',    desc: 'Authorized Economic Operator status across EU, UK, and APAC customs.' },
];

const dataTerminal = [
  { label: 'Avg Transit Time',   val: '14.2 Days' },
  { label: 'Compliance Rate',    val: '99.98%'    },
  { label: 'Vessel Utilization', val: '88%'        },
  { label: 'Active Port Nodes',  val: '142'        },
];

const envStats = [
  { value: '30%',    label: 'Fleet Emissions Reduction' },
  { value: '100%',   label: 'Recyclable Packaging'     },
  { value: 'Solar',  label: 'Powered Warehousing'      },
  { value: 'Tier 4', label: 'Engine Standard Fleet'    },
];

const bigStats = [
  { value: '30+',   label: 'Years of Operation' },
  { value: '142',   label: 'Active Port Nodes'  },
  { value: '48',    label: 'Countries Served'   },
  { value: '99.98%',label: 'Compliance Rate'    },
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
              <div className="inline-block px-2 py-1 bg-primary text-on-primary text-label-caps font-label-caps mb-4">ESTABLISHED 1994</div>
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
                  <span className="font-mono text-[13px] text-on-primary-container">142 ACTIVE NODES · SYSTEM V4.0</span>
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
            <p className="text-body-md text-secondary mb-8 pl-5">Operating across 4 continents with integrated tracking systems.</p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4"
              style={{ minHeight: 520 }}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            >
              <motion.div variants={cardAnim} className="md:col-span-2 bg-surface-container border border-outline-variant p-8 flex flex-col justify-between hover:border-primary transition-colors">
                <div>
                  <Globe size={36} className="text-primary mb-4" />
                  <h3 className="text-headline-sm font-headline-sm mb-2">Intercontinental Network</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">Our proprietary routing algorithms optimize lead times for precious metals and sensitive chemical exports across 48 key maritime ports.</p>
                </div>
                <div className="mt-4 font-mono text-[13px] text-primary">NODES: 142 ACTIVE | SYSTEM: V4.0</div>
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

          {/* ── Quality Protocols ── */}
          <motion.div
            className="mb-24 py-14 px-10 bg-inverse-surface text-inverse-on-surface relative overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
          >
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="bg-primary-container h-72 flex items-center justify-center order-2 md:order-1">
                <ShieldCheck size={80} className="text-on-primary-container/30" />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-headline-md font-headline-md mb-6">Rigorous Quality Protocols</h2>
                <p className="text-body-lg mb-8 opacity-80">Every gram of metal and every micron of substrate meets stringent global industrial standards.</p>
                <motion.div className="space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                  {certifications.map(({ num, title, desc }) => (
                    <motion.div key={num} variants={cardAnim} className="flex gap-4 items-start">
                      <div className="w-11 h-11 flex items-center justify-center border border-primary-fixed shrink-0">
                        <span className="text-headline-sm font-semibold">{num}</span>
                      </div>
                      <div>
                        <h4 className="text-label-caps font-label-caps mb-1">{title}</h4>
                        <p className="text-body-sm opacity-70 leading-relaxed">{desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
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
            className="grid md:grid-cols-2 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            {[
              { city: 'Mumbai HQ', addr: 'Bandra-Kurla Complex, Mumbai 400051, India', phone: '+91 22 6600 0000', email: 'trade@mayankg.com' },
              { city: 'London Office', addr: '1 Canada Square, Canary Wharf, London E14 5AB', phone: '+44 20 7946 0000', email: 'europe@mayankg.com' },
            ].map(({ city, addr, phone, email }) => (
              <motion.div key={city} variants={cardAnim} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-surface-container border border-outline-variant p-8 hover:border-primary transition-colors">
                <h3 className="text-headline-sm font-headline-sm mb-2">{city}</h3>
                <p className="text-body-md text-on-surface-variant mb-4">{addr}</p>
                <div className="font-mono text-[13px] text-secondary">{phone}</div>
                <div className="font-mono text-[13px] text-secondary mt-1">{email}</div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
