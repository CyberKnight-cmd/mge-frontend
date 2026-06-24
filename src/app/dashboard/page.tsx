'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, Package, BarChart3, Bell, Settings,
  ChevronRight, Users, TrendingUp, Search, Zap,
  DollarSign, Globe, Mail,
} from 'lucide-react';

interface PlatformStats {
  catalogEntryCount: number;
  entriesWithPpmCount: number;
  manufacturerCount: number;
  userCount: number;
  usersByRole: Record<string, number>;
}

interface MetalPrice {
  symbol: string;
  displaySymbol: string;
  name: string;
  priceUsd: number | null;
  changePct: number | null;
  live: boolean;
}

interface RegisteredUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyName: string | null;
  country: string | null;
  authProvider: string;
  emailVerified: boolean;
  bidBlocked: boolean;
  createdAt: string;
}

const ALL_ROLES = ['ADMIN', 'OWNER', 'SELLER', 'STAFF', 'CUSTOMER'] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, authFetch } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'OWNER';
  const canViewUsers = isAdmin || isOwner;

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [metals, setMetals] = useState<MetalPrice[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);

  async function handleBidBlockToggle(userId: number) {
    try {
      const res = await authFetch(`/api/v1/admin/users/${userId}/bid-block`, { method: 'PATCH' });
      if (res.ok) {
        const body = await res.json();
        const updated = body.data ?? body;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, bidBlocked: updated.bidBlocked } : u));
      }
    } catch {}
  }

  async function handleRoleChange(userId: number, newRole: string) {
    setUpdatingRole(userId);
    try {
      const res = await authFetch(`/api/v1/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        if (stats) {
          authFetch('/api/v1/stats')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(body => setStats(body.data ?? body))
            .catch(() => {});
        }
      }
    } catch {}
    setUpdatingRole(null);
  }

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!canViewUsers) {
      router.replace('/catalog');
    }
  }, [isLoading, isAuthenticated, canViewUsers, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    authFetch('/api/v1/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => setStats(body.data ?? body))
      .catch(() => {});

    authFetch('/api/v1/metals/prices')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => {
        const prices = (body.data ?? body).prices;
        if (Array.isArray(prices)) setMetals(prices);
      })
      .catch(() => {});
  }, [isAuthenticated, authFetch]);

  useEffect(() => {
    if (!canViewUsers) return;
    setUsersLoading(true);
    authFetch('/api/v1/admin/users')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => setUsers(body.data ?? body))
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [canViewUsers, authFetch]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  const statCards = stats ? [
    { label: 'Catalog Entries', value: stats.catalogEntryCount.toLocaleString(), icon: Package },
    { label: 'With PGM Data', value: stats.entriesWithPpmCount.toLocaleString(), icon: BarChart3 },
    { label: 'Manufacturers', value: stats.manufacturerCount.toLocaleString(), icon: Globe },
    { label: 'Registered Users', value: stats.userCount.toLocaleString(), icon: Users },
  ] : [];

  return (
    <div className="flex">
      <Sidebar />

      <div className="lg:ml-[240px] w-full min-h-[calc(100vh-64px)] bg-surface">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-surface-container-lowest border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-label-caps font-label-caps text-secondary mb-0.5">{isAdmin ? 'ADMIN' : 'ACCOUNT'}</p>
            <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-container px-4 py-2 border border-outline-variant flex items-center gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold text-[13px]">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-[13px] text-on-primary-container leading-none">{fullName}</p>
                <p className="text-label-caps font-label-caps text-[9px] text-outline mt-0.5">{user.role}{user.companyName ? ` · ${user.companyName}` : ''}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-margin-mobile md:p-margin-desktop space-y-6">

          {/* Platform Stats */}
          {statCards.length > 0 && (
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              {statCards.map(({ label, value, icon: Icon }) => (
                <motion.div key={label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-surface-container-lowest border border-outline-variant p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-label-caps font-label-caps text-[10px] text-outline">{label}</p>
                    <Icon size={16} className="text-secondary" />
                  </div>
                  <p className="font-mono text-[28px] font-bold leading-none">{value}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Live Metals + Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-12 gap-gutter">
            {/* Metal Prices */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant">
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-label-caps font-label-caps flex items-center gap-2">
                  <Zap size={13} className="text-secondary" /> LIVE PGM PRICES
                </h3>
                <Link href="/metals-pricing" className="text-label-caps font-label-caps text-[10px] text-primary hover:underline flex items-center gap-1">
                  FULL TERMINAL <ChevronRight size={10} />
                </Link>
              </div>
              <div className="p-6">
                {metals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {metals.map(m => (
                      <div key={m.symbol} className="bg-surface-container p-4 border border-outline-variant">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-label-caps font-label-caps text-[10px] text-outline">{m.name}</span>
                          <span className="font-mono text-[12px] font-bold text-primary">{m.displaySymbol}</span>
                        </div>
                        <p className="font-mono text-[22px] font-bold leading-none mb-1">
                          {m.priceUsd != null ? `$${m.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'OTC'}
                        </p>
                        <p className="text-[11px] font-mono text-outline">per troy oz</p>
                        {m.changePct != null && (
                          <p className={`font-mono text-[11px] font-bold mt-2 flex items-center gap-1 ${m.changePct >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            <TrendingUp size={11} />
                            {m.changePct > 0 ? '+' : ''}{m.changePct.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-5 h-5 border border-outline-variant border-t-primary rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-body-sm text-outline">Loading prices...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
              <div className="bg-surface-container-lowest border border-outline-variant p-5 flex-1">
                <p className="text-label-caps font-label-caps text-[10px] text-outline mb-3">QUICK ACTIONS</p>
                <div className="space-y-2">
                  {[
                    { icon: Search,   label: 'Search Catalog',  href: '/catalog' },
                    { icon: BarChart3, label: 'Metals Terminal', href: '/metals-pricing' },
                    ...(isAdmin ? [
                      { icon: Package, label: 'Manage Catalog', href: '/catalog' },
                    ] : []),
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center justify-between px-3 py-2 border border-outline-variant hover:bg-surface-container-low hover:border-primary transition-all group"
                    >
                      <div className="flex items-center gap-2 text-[13px] font-semibold">
                        <Icon size={14} className="text-secondary" />
                        {label}
                      </div>
                      <ChevronRight size={12} className="text-outline group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-primary-container text-on-primary p-6">
                <p className="text-label-caps font-label-caps text-on-primary-container text-[10px] mb-2">YOUR ACCOUNT</p>
                <div className="space-y-2 text-[11px] text-on-primary-container">
                  {[
                    { label: 'Email', val: user.email },
                    { label: 'Role', val: user.role },
                    { label: 'Email Verified', val: user.emailVerified ? 'Yes' : 'No' },
                    { label: 'Company', val: user.companyName || '—' },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between border-b border-on-primary-container/20 pb-1">
                      <span className="opacity-70">{label}</span>
                      <span className="font-bold text-right max-w-[60%] truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Admin/Owner: User Breakdown by Role */}
          {canViewUsers && stats?.usersByRole && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface-container-lowest border border-outline-variant p-6">
              <h3 className="text-label-caps font-label-caps flex items-center gap-2 mb-4">
                <Users size={14} className="text-secondary" />
                USER BREAKDOWN ({stats.userCount} TOTAL)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="bg-surface-container border border-outline-variant p-4 text-center">
                    <p className="font-mono text-[28px] font-bold text-primary leading-none mb-1">{count}</p>
                    <p className="text-label-caps font-label-caps text-[10px] text-outline">{role}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Admin/Owner: Registered Users */}
          {canViewUsers && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-label-caps font-label-caps flex items-center gap-2">
                  <Users size={14} className="text-secondary" />
                  REGISTERED USERS ({users.length})
                </h3>
              </div>

              {usersLoading ? (
                <div className="py-12 text-center">
                  <div className="w-5 h-5 border border-outline-variant border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-body-sm text-outline">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        {['ID', 'NAME', 'EMAIL', 'ROLE', 'COMPANY', 'PROVIDER', 'VERIFIED', ...(isAdmin ? ['BID BLOCKED'] : []), 'JOINED'].map(h => (
                          <th key={h} className="px-4 py-3 text-label-caps font-label-caps text-[10px] text-outline">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                          <td className="px-4 py-3 font-mono text-[12px] text-outline">#{u.id}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold">{u.firstName} {u.lastName}</td>
                          <td className="px-4 py-3 text-[12px] font-mono text-on-surface-variant">{u.email}</td>
                          <td className="px-4 py-3">
                            {isAdmin ? (
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                disabled={updatingRole === u.id}
                                className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border cursor-pointer focus:outline-none focus:border-primary transition-colors ${
                                  u.role === 'ADMIN' ? 'bg-primary text-on-primary border-primary' :
                                  u.role === 'OWNER' ? 'bg-secondary text-on-secondary border-secondary' :
                                  'bg-surface-container text-outline border-outline-variant'
                                } ${updatingRole === u.id ? 'opacity-50' : ''}`}
                              >
                                {ALL_ROLES.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${
                                u.role === 'ADMIN' ? 'bg-primary text-on-primary border-primary' :
                                u.role === 'OWNER' ? 'bg-secondary text-on-secondary border-secondary' :
                                'bg-surface-container text-outline border-outline-variant'
                              }`}>
                                {u.role}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[12px] text-on-surface-variant">{u.companyName || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-label-caps font-label-caps text-[10px] text-outline">{u.authProvider}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`w-2 h-2 rounded-full inline-block ${u.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleBidBlockToggle(u.id)}
                                className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border transition-colors ${
                                  u.bidBlocked
                                    ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                    : 'bg-surface-container text-outline border-outline-variant hover:bg-surface-container-high'
                                }`}
                              >
                                {u.bidBlocked ? 'BLOCKED' : 'ACTIVE'}
                              </button>
                            </td>
                          )}
                          <td className="px-4 py-3 text-[11px] font-mono text-outline">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="py-8 text-center text-outline text-body-sm">No registered users found.</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
