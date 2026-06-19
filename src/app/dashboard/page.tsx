'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp, TrendingDown, ShieldCheck, Clock, Package,
  BarChart3, ArrowUpRight, ArrowDownRight, Bell, Settings,
  ChevronRight, FileText, Truck, CircleDollarSign,
} from 'lucide-react';

type Tab = 'overview' | 'bids' | 'listings' | 'transactions';

const accountStats = [
  { label: 'Total Volume (YTD)',  value: '$4.28M',  change: '+18.4%',  up: true,  icon: CircleDollarSign },
  { label: 'Active Bids',        value: '12',      change: '3 expiring', up: null, icon: BarChart3        },
  { label: 'Active Listings',    value: '7',       change: '2 pending',  up: null, icon: Package          },
  { label: 'Settled Trades',     value: '94',      change: '+11 this mo',up: true,  icon: ShieldCheck      },
];

const activeBids = [
  { id: 'BID-88421', code: 'CER-V2-882', type: 'Ceramic',           qty: 200,  price: '$839.00', expires: '2h 14m',  status: 'active'  },
  { id: 'BID-88305', code: 'MET-F4-441', type: 'Metallic Foil',    qty: 50,   price: '$912.50', expires: '6h 03m',  status: 'active'  },
  { id: 'BID-88190', code: 'PLT-G3-110', type: 'Metallic Foil',    qty: 1000, price: '$861.00', expires: '1d 2h',   status: 'active'  },
  { id: 'BID-88044', code: 'DSL-F1-009', type: 'Diesel Particulate',qty: 10,   price: '$780.00', expires: '22m',     status: 'expiring'},
  { id: 'BID-87990', code: 'CER-L3-110', type: 'Ceramic',           qty: 400,  price: '$825.00', expires: '—',       status: 'pending' },
];

const activeListings = [
  { id: 'LST-44210', code: 'DPF-EU6-441', type: 'Diesel Particulate', qty: 40,  price: '$895.00', views: 128, status: 'live'   },
  { id: 'LST-44098', code: 'CER-MX-9920', type: 'Ceramic',            qty: 120, price: '$844.00', views: 64,  status: 'live'   },
  { id: 'LST-43912', code: 'MET-S2-202',  type: 'Metallic Foil',      qty: 300, price: '$921.00', views: 312, status: 'review' },
];

const transactions = [
  { id: 'TXN-00912', date: 'May 26, 2025', code: 'CER-V2-882', side: 'Buy',  qty: 150, total: '$125,850', status: 'settled'  },
  { id: 'TXN-00903', date: 'May 24, 2025', code: 'PLT-G3-110', side: 'Sell', qty: 500, total: '$432,500', status: 'settled'  },
  { id: 'TXN-00891', date: 'May 22, 2025', code: 'MET-F4-441', side: 'Buy',  qty: 80,  total: '$73,240',  status: 'settled'  },
  { id: 'TXN-00880', date: 'May 20, 2025', code: 'DSL-F1-009', side: 'Sell', qty: 12,  total: '$9,360',   status: 'pending'  },
  { id: 'TXN-00874', date: 'May 18, 2025', code: 'CER-L3-110', side: 'Buy',  qty: 200, total: '$168,400', status: 'settled'  },
  { id: 'TXN-00861', date: 'May 16, 2025', code: 'MET-S2-202', side: 'Sell', qty: 600, total: '$549,600', status: 'disputed' },
];

const volumeBars = [55, 42, 68, 75, 60, 88, 92, 70, 85, 78, 95, 100];
const months     = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];

const statusStyle: Record<string, string> = {
  active:   'bg-green-100  text-green-800  border-green-200',
  expiring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending:  'bg-surface-container text-outline border-outline-variant',
  live:     'bg-green-100  text-green-800  border-green-200',
  review:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  settled:  'bg-green-100  text-green-800  border-green-200',
  disputed: 'bg-red-100    text-red-800    border-red-200',
};

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="flex">
      <Sidebar />

      <div className="lg:ml-[240px] w-full min-h-[calc(100vh-64px)] bg-surface">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-surface-container-lowest border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-label-caps font-label-caps text-secondary mb-0.5">TRADER ACCOUNT</p>
            <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">Command Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 border border-outline-variant hover:bg-surface-container transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </button>
            <button className="p-2 border border-outline-variant hover:bg-surface-container transition-colors">
              <Settings size={16} />
            </button>
            <div className="bg-primary-container px-4 py-2 border border-outline-variant flex items-center gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold text-[13px]">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-[13px] text-on-primary-container leading-none">{fullName}</p>
                <p className="text-label-caps font-label-caps text-[9px] text-outline mt-0.5">{user.role} · {user.companyName || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-margin-mobile md:p-margin-desktop space-y-6">

          {/* KPI Cards */}
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            {accountStats.map(({ label, value, change, up, icon: Icon }) => (
              <motion.div key={label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-surface-container-lowest border border-outline-variant p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
                <div className="flex justify-between items-start mb-3">
                  <p className="text-label-caps font-label-caps text-[10px] text-outline">{label}</p>
                  <Icon size={16} className="text-secondary" />
                </div>
                <p className="font-mono text-[28px] font-bold leading-none mb-2">{value}</p>
                <div className={`flex items-center gap-1 text-[11px] font-bold ${
                  up === true ? 'text-green-700' : up === false ? 'text-error' : 'text-outline'
                }`}>
                  {up === true  && <ArrowUpRight   size={12} />}
                  {up === false && <ArrowDownRight size={12} />}
                  {change}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Volume chart + Alerts */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-12 gap-gutter">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant">
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-headline-sm font-headline-sm uppercase tracking-tight">Trade Volume (12 Months)</h3>
                <span className="font-mono text-[11px] text-outline">USD MILLIONS</span>
              </div>
              <div className="p-6">
                <div className="flex items-end gap-2 h-40 w-full">
                  {volumeBars.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full ${i === volumeBars.length - 1 ? 'bg-primary' : 'bg-secondary-container'}`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="font-mono text-[9px] text-outline">{months[i]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-outline-variant">
                  {[
                    { label: 'Avg Monthly', val: '$356K' },
                    { label: 'Best Month',  val: '$528K' },
                    { label: 'Growth YoY',  val: '+18.4%' },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <p className="text-label-caps font-label-caps text-[10px] text-outline">{label}</p>
                      <p className="font-mono text-[15px] font-bold mt-1">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
              {/* Compliance score */}
              <div className="bg-primary-container text-on-primary p-6 flex-1">
                <p className="text-label-caps font-label-caps text-on-primary-container text-[10px] mb-2">COMPLIANCE SCORE</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-mono text-[40px] font-bold leading-none">A+</span>
                  <span className="text-label-caps font-label-caps text-on-primary-container opacity-70">TIER 2</span>
                </div>
                <div className="space-y-2 text-[11px] text-on-primary-container">
                  {[
                    { label: 'KYC Status',        val: 'Verified' },
                    { label: 'AML Clearance',     val: 'Active'   },
                    { label: 'Dispute Rate',       val: '0.8%'     },
                    { label: 'On-time Settlement', val: '98.9%'    },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between border-b border-on-primary-container/20 pb-1">
                      <span className="opacity-70">{label}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-surface-container-lowest border border-outline-variant p-5">
                <p className="text-label-caps font-label-caps text-[10px] text-outline mb-3">QUICK ACTIONS</p>
                <div className="space-y-2">
                  {[
                    { icon: Package,    label: 'New Listing',     href: '/catalog' },
                    { icon: BarChart3,  label: 'Place a Bid',     href: '/catalog' },
                    { icon: FileText,   label: 'Export Report',   href: '#'        },
                    { icon: Truck,      label: 'Track Shipment',  href: '#'        },
                  ].map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="flex items-center justify-between px-3 py-2 border border-outline-variant hover:bg-surface-container-low hover:border-primary transition-all group"
                    >
                      <div className="flex items-center gap-2 text-[13px] font-semibold">
                        <Icon size={14} className="text-secondary" />
                        {label}
                      </div>
                      <ChevronRight size={12} className="text-outline group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabbed data section */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-outline-variant overflow-x-auto">
              {([
                { key: 'overview',     label: 'Overview'       },
                { key: 'bids',         label: 'Active Bids'    },
                { key: 'listings',     label: 'My Listings'    },
                { key: 'transactions', label: 'Transactions'   },
              ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-6 py-3 text-label-caps font-label-caps whitespace-nowrap border-b-2 transition-colors ${
                    tab === key
                      ? 'border-primary text-primary bg-surface-container-low'
                      : 'border-transparent text-outline hover:text-on-surface hover:bg-surface-container-low/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {tab === 'overview' && (
              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-label-caps font-label-caps text-outline mb-4">RECENT BID ACTIVITY</h4>
                  <div className="space-y-3">
                    {activeBids.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex items-center justify-between py-2 border-b border-outline-variant">
                        <div>
                          <p className="font-mono text-[13px] font-bold text-primary">{b.code}</p>
                          <p className="text-label-caps font-label-caps text-[10px] text-outline">{b.qty} units · {b.price}/unit</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${statusStyle[b.status]}`}>
                            {b.status.toUpperCase()}
                          </span>
                          <p className="text-label-caps font-label-caps text-[10px] text-outline mt-1 flex items-center gap-1 justify-end">
                            <Clock size={9} /> {b.expires}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-label-caps font-label-caps text-outline mb-4">RECENT TRANSACTIONS</h4>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-outline-variant">
                        <div>
                          <p className="font-mono text-[13px] font-bold">{t.code}</p>
                          <p className="text-label-caps font-label-caps text-[10px] text-outline">{t.date} · {t.side}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-[13px] font-bold ${t.side === 'Sell' ? 'text-green-700' : 'text-primary'}`}>
                            {t.side === 'Sell' ? '+' : '−'}{t.total}
                          </p>
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${statusStyle[t.status]}`}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bids tab */}
            {tab === 'bids' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      {['BID ID', 'PRODUCT CODE', 'TYPE', 'QTY', 'BID PRICE', 'EXPIRES', 'STATUS', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-label-caps font-label-caps text-[10px] text-outline">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeBids.map((b, i) => (
                      <tr key={b.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                        <td className="px-4 py-3 font-mono text-[12px] text-outline">{b.id}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold text-primary">{b.code}</td>
                        <td className="px-4 py-3">
                          <span className="bg-surface-container-high border border-outline-variant px-2 py-0.5 text-[11px]">{b.type}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px]">{b.qty.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold">{b.price}</td>
                        <td className="px-4 py-3 font-mono text-[12px] flex items-center gap-1 text-outline">
                          <Clock size={11} /> {b.expires}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${statusStyle[b.status]}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-label-caps font-label-caps text-[10px] text-primary hover:underline">
                            MODIFY
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Listings tab */}
            {tab === 'listings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      {['LISTING ID', 'PRODUCT CODE', 'TYPE', 'QTY', 'ASKING PRICE', 'VIEWS', 'STATUS', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-label-caps font-label-caps text-[10px] text-outline">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeListings.map((l, i) => (
                      <tr key={l.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                        <td className="px-4 py-3 font-mono text-[12px] text-outline">{l.id}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold text-primary">{l.code}</td>
                        <td className="px-4 py-3">
                          <span className="bg-surface-container-high border border-outline-variant px-2 py-0.5 text-[11px]">{l.type}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px]">{l.qty}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold">{l.price}</td>
                        <td className="px-4 py-3 font-mono text-[13px]">{l.views}</td>
                        <td className="px-4 py-3">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${statusStyle[l.status]}`}>
                            {l.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button className="text-label-caps font-label-caps text-[10px] text-primary hover:underline">EDIT</button>
                          <button className="text-label-caps font-label-caps text-[10px] text-error hover:underline">REMOVE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-outline-variant">
                  <button className="bg-primary text-on-primary text-label-caps font-label-caps px-6 py-2 hover:opacity-80 transition-opacity">
                    + ADD NEW LISTING
                  </button>
                </div>
              </div>
            )}

            {/* Transactions tab */}
            {tab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      {['TXN ID', 'DATE', 'PRODUCT CODE', 'SIDE', 'QTY', 'TOTAL VALUE', 'STATUS'].map((h) => (
                        <th key={h} className="px-4 py-3 text-label-caps font-label-caps text-[10px] text-outline">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={t.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                        <td className="px-4 py-3 font-mono text-[12px] text-outline">{t.id}</td>
                        <td className="px-4 py-3 text-body-sm text-on-surface-variant">{t.date}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold text-primary">{t.code}</td>
                        <td className="px-4 py-3">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 font-bold ${
                            t.side === 'Buy' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
                          }`}>
                            {t.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px]">{t.qty}</td>
                        <td className={`px-4 py-3 font-mono text-[13px] font-bold ${t.side === 'Sell' ? 'text-green-700' : ''}`}>
                          {t.total}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${statusStyle[t.status]}`}>
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-outline-variant flex items-center justify-between bg-surface-container">
                  <span className="text-body-sm text-on-surface-variant">Showing 6 of 94 transactions</span>
                  <button className="text-label-caps font-label-caps text-primary hover:underline text-[11px] flex items-center gap-1">
                    VIEW FULL LEDGER <TrendingUp size={11} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Pending actions / Alerts strip */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid md:grid-cols-3 gap-gutter">
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant p-5">
              <h4 className="text-label-caps font-label-caps text-outline mb-4">PENDING ACTIONS</h4>
              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, text: 'Annual KYC refresh due in 14 days — upload new company documents.', cta: 'Upload Now'    },
                  { icon: FileText,    text: 'Shipment TXN-00880 awaiting customs clearance confirmation.',       cta: 'Review Docs'  },
                  { icon: Clock,       text: 'BID-88044 expires in 22 minutes. Renew to stay in queue.',          cta: 'Renew Bid'    },
                ].map(({ icon: Icon, text, cta }) => (
                  <div key={cta} className="flex items-start gap-3 py-2 border-b border-outline-variant last:border-0">
                    <Icon size={14} className="text-secondary mt-0.5 shrink-0" />
                    <p className="text-body-sm text-on-surface-variant flex-1 leading-relaxed">{text}</p>
                    <button className="text-label-caps font-label-caps text-[10px] text-primary border border-primary px-3 py-1 hover:bg-primary hover:text-on-primary transition-all whitespace-nowrap">
                      {cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-inverse-surface text-inverse-on-surface p-6 flex flex-col justify-between">
              <div>
                <p className="text-label-caps font-label-caps text-[10px] opacity-60 mb-2">ACCOUNT TIER</p>
                <h4 className="text-headline-md font-headline-md mb-1">Tier 2 Trader</h4>
                <p className="text-body-sm opacity-70 leading-relaxed">
                  $760K more in settled volume unlocks Tier 1 access — lower fees, priority settlement, and dedicated account management.
                </p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-mono mb-1 opacity-70">
                  <span>$4.28M settled</span><span>$5.0M target</span>
                </div>
                <div className="w-full h-1.5 bg-inverse-on-surface/20">
                  <div className="bg-on-primary h-full" style={{ width: '85.6%' }} />
                </div>
                <p className="text-[10px] opacity-50 mt-1">85.6% to Tier 1</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
