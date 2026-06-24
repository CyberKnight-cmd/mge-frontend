'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingCart, Plus, X, Search, AlertCircle,
  Loader2, Trash2, Clock, Filter, Snowflake, Play,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────

interface BidItem {
  id: number;
  catalogEntryId: number;
  primaryCode: string;
  manufacturer: string;
  manufacturerBrand: string | null;
  catalystType: string;
  bidType: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number;
  currency: string;
  adjustable: boolean;
  note: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  mine: boolean;
  ptPriceAtBid: number | null;
  pdPriceAtBid: number | null;
  rhPriceAtBid: number | null;
  ptPpm: number | null;
  pdPpm: number | null;
  rhPpm: number | null;
  weightGrams: number | null;
  hasPgmData: boolean;
  posterName?: string;
  posterCompany?: string;
  posterPhone?: string;
  posterEmail?: string;
}

interface SearchResult {
  id: number;
  primaryCode: string;
  manufacturer: string;
  manufacturerBrand: string | null;
  catalystType: string;
}

interface MetalPrices { pt: number; pd: number; rh: number; }

type Tab = 'active' | 'mine' | 'moderation';
type TypeFilter = 'ALL' | 'BUY' | 'SELL';

// ── Helpers ────────────────────────────────────────────────────────────────

const GRAMS_PER_TROY_OZ = 31.1035;

function computeAdjustedPrice(bid: BidItem, current: MetalPrices | null): { adjusted: number; delta: number } | null {
  if (!bid.adjustable || !bid.hasPgmData || !current || !bid.ptPriceAtBid) return null;

  const ptDelta = (current.pt - bid.ptPriceAtBid) / GRAMS_PER_TROY_OZ;
  const pdDelta = (current.pd - (bid.pdPriceAtBid ?? current.pd)) / GRAMS_PER_TROY_OZ;
  const rhDelta = (current.rh - (bid.rhPriceAtBid ?? current.rh)) / GRAMS_PER_TROY_OZ;
  const weight = bid.weightGrams ?? 1000;

  const adj = ((bid.ptPpm ?? 0) * ptDelta + (bid.pdPpm ?? 0) * pdDelta + (bid.rhPpm ?? 0) * rhDelta) / 1_000_000 * weight;
  const adjusted = Math.round((bid.pricePerUnit + adj) * 100) / 100;
  return { adjusted, delta: Math.round(adj * 100) / 100 };
}

function fmtPrice(value: number, currency: string) {
  return currency === 'INR'
    ? '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-800 border-green-200',
  FROZEN:   'bg-blue-100 text-blue-800 border-blue-200',
  ARCHIVED: 'bg-surface-container text-outline border-outline-variant',
  REMOVED:  'bg-red-100 text-red-800 border-red-200',
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function MarketplaceContent() {
  const { user, authFetch } = useAuth();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'OWNER';
  const canModerate = isAdmin || isOwner;
  const canSeePoster = canModerate || user?.role === 'SELLER';

  const [tab, setTab] = useState<Tab>('active');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [bids, setBids] = useState<BidItem[]>([]);
  const [myBids, setMyBids] = useState<BidItem[]>([]);
  const [allBids, setAllBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [metalPrices, setMetalPrices] = useState<MetalPrices | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const prefillEntryId = searchParams.get('entryId');
  const prefillType = searchParams.get('type') as 'BUY' | 'SELL' | null;

  useEffect(() => { if (prefillEntryId) setShowPostForm(true); }, [prefillEntryId]);

  const fetchBids = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/v1/bids');
      if (res.ok) { const body = await res.json(); setBids(body.data ?? body); }
    } catch {} finally { setLoading(false); }
  }, [authFetch]);

  const fetchMyBids = useCallback(async () => {
    try {
      const res = await authFetch('/api/v1/bids/mine');
      if (res.ok) { const body = await res.json(); setMyBids(body.data ?? body); }
    } catch {}
  }, [authFetch]);

  const fetchAllBids = useCallback(async () => {
    if (!canModerate) return;
    try {
      const res = await authFetch('/api/v1/bids/all');
      if (res.ok) { const body = await res.json(); setAllBids(body.data ?? body); }
    } catch {}
  }, [authFetch, canModerate]);

  const refreshAll = useCallback(() => { fetchBids(); fetchMyBids(); fetchAllBids(); }, [fetchBids, fetchMyBids, fetchAllBids]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  useEffect(() => {
    authFetch('/api/v1/metals/prices')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => {
        const prices = (body.data ?? body).prices;
        if (!Array.isArray(prices)) return;
        let pt = 0, pd = 0, rh = 0;
        for (const p of prices) {
          if (p.symbol === 'XPT') pt = p.priceUsd ?? 0;
          else if (p.symbol === 'XPD') pd = p.priceUsd ?? 0;
          else if (p.symbol === 'XRH') rh = p.priceUsd ?? 0;
        }
        if (pt > 0) setMetalPrices({ pt, pd, rh });
      })
      .catch(() => {});
  }, [authFetch]);

  const handleAction = async (bidId: number, action: 'freeze' | 'remove' | 'admin-remove') => {
    setActionLoading(bidId);
    try {
      const url = action === 'freeze' ? `/api/v1/bids/${bidId}/freeze`
        : action === 'admin-remove' ? `/api/v1/bids/${bidId}/admin`
        : `/api/v1/bids/${bidId}`;
      const method = action === 'freeze' ? 'PATCH' : 'DELETE';
      const res = await authFetch(url, { method });
      if (!res.ok) {
        console.error('Action failed:', res.status, await res.text().catch(() => ''));
        setActionLoading(null);
        return;
      }
      if (action === 'freeze') {
        const body = await res.json();
        const updated = body.data ?? body;
        const newStatus = updated.status as string;
        setBids(prev => newStatus === 'ACTIVE'
          ? [...prev.filter(b => b.id !== bidId), ...myBids.filter(b => b.id === bidId).map(b => ({ ...b, status: newStatus }))]
          : prev.filter(b => b.id !== bidId)
        );
        setMyBids(prev => prev.map(b => b.id === bidId ? { ...b, status: newStatus } : b));
        setAllBids(prev => prev.map(b => b.id === bidId ? { ...b, status: newStatus } : b));
      } else {
        setBids(prev => prev.filter(b => b.id !== bidId));
        setMyBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'REMOVED' } : b));
        setAllBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'REMOVED' } : b));
      }
    } catch (e) {
      console.error('Action error:', e);
    }
    setActionLoading(null);
  };

  const displayBids = (tab === 'active' ? bids : tab === 'mine' ? myBids : allBids)
    .filter(b => typeFilter === 'ALL' || b.bidType === typeFilter);

  const activeBidCount = myBids.filter(b => b.status === 'ACTIVE').length;
  const frozenBidCount = myBids.filter(b => b.status === 'FROZEN').length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-label-caps font-label-caps text-secondary mb-0.5">EXCHANGE</p>
          <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">Marketplace</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-outline font-mono">{bids.length} active</span>
          <button
            onClick={() => setShowPostForm(true)}
            className="flex items-center gap-2 bg-primary text-on-primary text-label-caps font-label-caps px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> POST A BID
          </button>
        </div>
      </motion.div>

      <div className="p-margin-mobile md:p-margin-desktop space-y-4">
        {/* Tabs + Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex border border-outline-variant overflow-hidden">
            {([
              { key: 'active' as Tab, label: 'Active Bids' },
              { key: 'mine' as Tab, label: `My Bids (${activeBidCount} active${frozenBidCount ? `, ${frozenBidCount} frozen` : ''})` },
              ...(canModerate ? [{ key: 'moderation' as Tab, label: 'All Bids' }] : []),
            ]).map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 text-label-caps font-label-caps text-[11px] transition-colors ${tab === key ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline hover:bg-surface-container-high'}`}
              >{label}</button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={12} className="text-outline" />
            {(['ALL', 'BUY', 'SELL'] as TypeFilter[]).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-label-caps font-label-caps text-[10px] border transition-colors ${typeFilter === t ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-outline border-outline-variant'}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Bids Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-5 h-5 border border-outline-variant border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-body-sm text-outline">Loading bids...</p>
            </div>
          ) : displayBids.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart size={32} className="text-outline mx-auto mb-3" />
              <p className="text-body-sm text-on-surface-variant">
                {tab === 'mine' ? 'You haven\'t posted any bids yet.' : 'No bids found.'}
              </p>
            </div>
          ) : (
            <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container border-b border-outline-variant">
                  <tr>
                    {[
                      'CODE', 'TYPE', 'QTY', 'PRICE/UNIT', 'MODE', 'STATUS',
                      ...(tab !== 'active' ? ['EXPIRES'] : []),
                      ...(canSeePoster && tab !== 'mine' ? ['POSTER'] : []),
                      'ACTIONS',
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-label-caps font-label-caps text-[10px] text-outline whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayBids.map((b, i) => {
                    const adj = computeAdjustedPrice(b, metalPrices);
                    const days = daysLeft(b.expiresAt);
                    const isFrozen = b.status === 'FROZEN';
                    const isActionLoading = actionLoading === b.id;

                    return (
                      <tr key={b.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${isFrozen ? 'bg-blue-50/30' : i % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                        <td className="px-4 py-3">
                          <Link href={`/catalog/${b.catalogEntryId}`} className="font-mono text-[13px] font-bold text-primary hover:underline">{b.primaryCode}</Link>
                          <span className="block text-[10px] text-outline">{b.manufacturerBrand ?? b.manufacturer}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border font-bold ${b.bidType === 'BUY' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary text-on-secondary border-secondary'}`}>{b.bidType}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px]">{b.quantity.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {isFrozen ? (
                            <div><span className="font-mono text-[13px] font-bold">{fmtPrice(b.pricePerUnit, b.currency)}</span><span className="block text-[9px] text-blue-600 font-bold">LOCKED</span></div>
                          ) : adj ? (
                            <div><span className="font-mono text-[13px] font-bold">{fmtPrice(adj.adjusted, b.currency)}</span><span className={`block font-mono text-[10px] font-bold ${adj.delta >= 0 ? 'text-green-700' : 'text-red-600'}`}>{adj.delta >= 0 ? '+' : ''}{fmtPrice(Math.abs(adj.delta), b.currency)} PGM</span></div>
                          ) : (
                            <div><span className="font-mono text-[13px] font-bold">{fmtPrice(b.pricePerUnit, b.currency)}</span><span className="block text-[9px] text-outline">FIXED</span></div>
                          )}
                        </td>
                        <td className="px-4 py-3"><span className={`text-label-caps font-label-caps text-[9px] px-1.5 py-0.5 border ${b.adjustable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-surface-container text-outline border-outline-variant'}`}>{b.currency} · {b.adjustable ? 'ADJ' : 'FIX'}</span></td>
                        <td className="px-4 py-3">
                          <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${STATUS_STYLE[b.status] ?? ''}`}>{b.status === 'FROZEN' && <Snowflake size={9} className="inline mr-1" />}{b.status}</span>
                          {b.status === 'ACTIVE' && days <= 3 && <span className="block text-[9px] text-error font-bold mt-0.5">{days}d left</span>}
                        </td>
                        {tab !== 'active' && <td className="px-4 py-3 text-[11px] font-mono text-outline"><Clock size={10} className="inline mr-1" />{new Date(b.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>}
                        {canSeePoster && tab !== 'mine' && <td className="px-4 py-3">{b.posterName ? <div><span className="text-[12px] font-semibold">{b.posterName}</span><span className="block text-[10px] text-outline font-mono">{b.posterPhone ?? b.posterEmail ?? '—'}</span></div> : <span className="text-outline text-[11px]">—</span>}</td>}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {isActionLoading ? <Loader2 size={12} className="animate-spin text-outline" /> : <>
                              {b.mine && (b.status === 'ACTIVE' || b.status === 'FROZEN') && <button onClick={() => handleAction(b.id, 'freeze')} title={isFrozen ? 'Unfreeze' : 'Freeze'} className={`text-label-caps font-label-caps text-[10px] px-2 py-1.5 border transition-colors flex items-center gap-1 ${isFrozen ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' : 'bg-surface-container text-outline border-outline-variant hover:border-blue-300 hover:text-blue-600'}`}>{isFrozen ? <><Play size={9} /> UNFREEZE</> : <><Snowflake size={9} /> FREEZE</>}</button>}
                              {(b.mine || canModerate) && (b.status === 'ACTIVE' || b.status === 'FROZEN') && <button onClick={() => handleAction(b.id, canModerate && !b.mine ? 'admin-remove' : 'remove')} className="text-label-caps font-label-caps text-[10px] px-2 py-1.5 border border-red-200 text-error hover:bg-red-50 transition-colors flex items-center gap-1"><Trash2 size={9} /> REMOVE</button>}
                            </>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-outline-variant">
              {displayBids.map(b => {
                const adj = computeAdjustedPrice(b, metalPrices);
                const days = daysLeft(b.expiresAt);
                const isFrozen = b.status === 'FROZEN';
                const isActionLoading = actionLoading === b.id;

                return (
                  <div key={b.id} className={`p-4 space-y-3 ${isFrozen ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/catalog/${b.catalogEntryId}`} className="font-mono text-[14px] font-bold text-primary hover:underline">{b.primaryCode}</Link>
                        <span className="block text-[11px] text-outline">{b.manufacturerBrand ?? b.manufacturer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border font-bold ${b.bidType === 'BUY' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary text-on-secondary border-secondary'}`}>{b.bidType}</span>
                        <span className={`text-label-caps font-label-caps text-[10px] px-2 py-0.5 border ${STATUS_STYLE[b.status] ?? ''}`}>{b.status === 'FROZEN' && <Snowflake size={9} className="inline mr-1" />}{b.status}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        {isFrozen ? (
                          <><span className="font-mono text-[16px] font-bold">{fmtPrice(b.pricePerUnit, b.currency)}</span><span className="text-[9px] text-blue-600 font-bold ml-1">LOCKED</span></>
                        ) : adj ? (
                          <><span className="font-mono text-[16px] font-bold">{fmtPrice(adj.adjusted, b.currency)}</span><span className={`ml-1 font-mono text-[10px] font-bold ${adj.delta >= 0 ? 'text-green-700' : 'text-red-600'}`}>{adj.delta >= 0 ? '+' : ''}{fmtPrice(Math.abs(adj.delta), b.currency)}</span></>
                        ) : (
                          <><span className="font-mono text-[16px] font-bold">{fmtPrice(b.pricePerUnit, b.currency)}</span><span className="text-[9px] text-outline ml-1">FIXED</span></>
                        )}
                        <span className="block text-[11px] text-outline">{b.quantity.toLocaleString()} units · {b.currency} · {b.adjustable ? 'ADJ' : 'FIX'}</span>
                      </div>
                      {b.status === 'ACTIVE' && days <= 3 && <span className="text-[10px] text-error font-bold">{days}d left</span>}
                    </div>

                    {b.note && <p className="text-[11px] text-on-surface-variant">{b.note}</p>}

                    {canSeePoster && tab !== 'mine' && b.posterName && (
                      <div className="text-[11px] text-outline"><span className="font-semibold text-on-surface-variant">{b.posterName}</span> · {b.posterPhone ?? b.posterEmail ?? '—'}</div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-outline font-mono"><Clock size={10} className="inline mr-1" />{new Date(b.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <div className="flex items-center gap-2">
                        {isActionLoading ? <Loader2 size={14} className="animate-spin text-outline" /> : <>
                          {b.mine && (b.status === 'ACTIVE' || b.status === 'FROZEN') && (
                            <button onClick={() => handleAction(b.id, 'freeze')} className={`text-label-caps font-label-caps text-[10px] px-3 py-2 border transition-colors flex items-center gap-1 ${isFrozen ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-surface-container text-outline border-outline-variant'}`}>
                              {isFrozen ? <><Play size={10} /> UNFREEZE</> : <><Snowflake size={10} /> FREEZE</>}
                            </button>
                          )}
                          {(b.mine || canModerate) && (b.status === 'ACTIVE' || b.status === 'FROZEN') && (
                            <button onClick={() => handleAction(b.id, canModerate && !b.mine ? 'admin-remove' : 'remove')} className="text-label-caps font-label-caps text-[10px] px-3 py-2 border border-red-200 text-error flex items-center gap-1">
                              <Trash2 size={10} /> REMOVE
                            </button>
                          )}
                        </>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </motion.div>

        {/* Frozen bids info banner */}
        {tab === 'mine' && frozenBidCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2.5 text-[11px] text-blue-800">
            <Snowflake size={12} />
            {frozenBidCount} frozen bid{frozenBidCount > 1 ? 's' : ''} — price locked, hidden from other users. Unfreeze to make visible again.
          </div>
        )}
      </div>

      {/* Post Bid Modal */}
      {showPostForm && (
        <PostBidModal
          onClose={() => setShowPostForm(false)}
          onPosted={() => { setShowPostForm(false); refreshAll(); }}
          activeBidCount={activeBidCount}
          prefillEntryId={prefillEntryId ? parseInt(prefillEntryId) : undefined}
          prefillType={prefillType ?? undefined}
        />
      )}
    </div>
  );
}

// ── Post Bid Modal ─────────────────────────────────────────────────────────

function PostBidModal({ onClose, onPosted, activeBidCount, prefillEntryId, prefillType }: {
  onClose: () => void;
  onPosted: () => void;
  activeBidCount: number;
  prefillEntryId?: number;
  prefillType?: 'BUY' | 'SELL';
}) {
  const { authFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SearchResult | null>(null);
  const [bidType, setBidType] = useState<'BUY' | 'SELL'>(prefillType ?? 'BUY');
  const [prefillLoaded, setPrefillLoaded] = useState(!prefillEntryId);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [adjustable, setAdjustable] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!prefillEntryId || prefillLoaded) return;
    authFetch(`/api/v1/catalog/${prefillEntryId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(body => {
        const e = body.data ?? body;
        setSelectedEntry({ id: e.id, primaryCode: e.primaryCode, manufacturer: e.manufacturer, manufacturerBrand: e.manufacturerBrand, catalystType: e.catalystType });
      })
      .catch(() => {})
      .finally(() => setPrefillLoaded(true));
  }, [prefillEntryId, prefillLoaded]);

  const handleSearch = (q: string) => {
    setSearch(q);
    if (searchTimer) clearTimeout(searchTimer);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearchTimer(setTimeout(async () => {
      try {
        const res = await authFetch(`/api/v1/catalog/search?q=${encodeURIComponent(q.trim())}&size=6`);
        if (res.ok) {
          const body = await res.json();
          const content = (body.data ?? body).content ?? body.data ?? body;
          setResults(Array.isArray(content) ? content : []);
        }
      } catch {}
    }, 250));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) { setError('Select a catalog entry'); return; }
    if (!price || parseFloat(price) <= 0) { setError('Enter a valid price'); return; }
    if (activeBidCount >= 10) { setError('You have 10 active bids. Remove or freeze one first.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await authFetch('/api/v1/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogEntryId: selectedEntry.id,
          bidType,
          quantity,
          pricePerUnit: parseFloat(price),
          currency,
          adjustable,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message || `Error ${res.status}`);
      }
      onPosted();
    } catch (err: any) {
      setError(err.message || 'Failed to post bid');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-surface-container-lowest border border-outline-variant w-full max-w-[calc(100vw-24px)] md:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h3 className="text-label-caps font-label-caps text-on-surface">POST A BID ({activeBidCount}/10 active)</h3>
          <button onClick={onClose} className="p-1 text-outline hover:text-on-surface"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Entry Search */}
          <div>
            <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">CATALOG ENTRY *</label>
            {selectedEntry ? (
              <div className="flex items-center justify-between bg-surface-container border border-outline-variant px-3 py-2">
                <div>
                  <span className="font-mono text-[13px] font-bold text-primary">{selectedEntry.primaryCode}</span>
                  <span className="text-[10px] text-outline ml-2">{selectedEntry.manufacturerBrand ?? selectedEntry.manufacturer}</span>
                </div>
                <button type="button" onClick={() => { setSelectedEntry(null); setSearch(''); setAdjustable(false); }} className="text-outline hover:text-error">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by code or brand..."
                  className="w-full bg-surface-container border border-outline-variant pl-9 pr-3 py-2.5 text-[13px] focus:border-primary focus:outline-none" />
                {results.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-surface-container-lowest border border-outline-variant shadow-lg max-h-48 overflow-y-auto">
                    {results.map(r => (
                      <button key={r.id} type="button"
                        onClick={() => { setSelectedEntry(r); setResults([]); setSearch(''); }}
                        className="w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center justify-between border-b border-outline-variant last:border-0">
                        <span className="font-mono text-[12px] font-bold text-primary">{r.primaryCode}</span>
                        <span className="text-[10px] text-outline">{r.manufacturerBrand ?? r.manufacturer}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">BID TYPE *</label>
            <div className="flex gap-2">
              {(['BUY', 'SELL'] as const).map(t => (
                <button key={t} type="button" onClick={() => setBidType(t)}
                  className={`flex-1 py-2.5 text-label-caps font-label-caps text-[11px] border transition-colors ${
                    bidType === t ? (t === 'BUY' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary text-on-secondary border-secondary')
                    : 'bg-surface-container text-outline border-outline-variant'
                  }`}>{t === 'BUY' ? '↓ BUY' : '↑ SELL'}</button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">CURRENCY *</label>
            <div className="flex gap-2">
              {(['USD', 'INR'] as const).map(c => (
                <button key={c} type="button" onClick={() => setCurrency(c)}
                  className={`flex-1 py-2.5 text-label-caps font-label-caps text-[11px] border transition-colors ${
                    currency === c ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-outline border-outline-variant'
                  }`}>{c === 'USD' ? '$ USD' : '₹ INR'}</button>
              ))}
            </div>
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">QUANTITY *</label>
              <input type="number" min={1} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] font-mono focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">PRICE/UNIT ({currency}) *</label>
              <input type="number" min={0.01} step={0.01} value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] font-mono focus:border-primary focus:outline-none" />
            </div>
          </div>

          {/* Adjustable toggle */}
          <div className="flex items-center justify-between bg-surface-container border border-outline-variant px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-on-surface">PGM Market Adjustment</p>
              <p className="text-[10px] text-outline mt-0.5">
                {adjustable
                  ? 'Price will auto-adjust with Pt/Pd/Rh market changes'
                  : 'Price stays fixed regardless of market movement'}
              </p>
            </div>
            <button type="button" onClick={() => setAdjustable(!adjustable)}
              className={`relative w-10 h-5 rounded-full transition-colors ${adjustable ? 'bg-primary' : 'bg-outline-variant'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${adjustable ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {adjustable && (
            <p className="text-[10px] text-on-surface-variant bg-green-50 border border-green-200 px-3 py-1.5">
              Metal spot prices (Pt/Pd/Rh) will be snapshotted at bid creation. Future price changes adjust your bid automatically. Only works for entries with PGM data.
            </p>
          )}

          {/* Note */}
          <div>
            <label className="block text-label-caps font-label-caps text-[10px] text-on-surface-variant mb-1.5">NOTE <span className="text-outline">(optional, max 500)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value.slice(0, 500))} rows={2} placeholder="Any additional details..."
              className="w-full bg-surface-container border border-outline-variant px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/30 px-3 py-2 text-[12px] text-error">
              <AlertCircle size={12} />{error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 border border-outline-variant text-label-caps font-label-caps text-[11px] hover:bg-surface-container transition-colors">CANCEL</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary text-label-caps font-label-caps text-[11px] hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <><Loader2 size={12} className="animate-spin" /> POSTING...</> : 'POST BID'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
