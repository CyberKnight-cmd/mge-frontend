'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CartItem {
  cartItemId: number;
  quantity: number;
  addedAt: string;
  catalystId: number;
  primaryCode: string;
  secondaryCode: string | null;
  manufacturer: string;
  manufacturerBrand: string;
  catalystType: string;
  ptPpm: number | null;
  pdPpm: number | null;
  rhPpm: number | null;
  weightPerPieceGrams: number | null;
  terms: number | null;
  imageCount: number;
  valuation: {
    perKg: { usd: number; inr: number };
    perGram: { usd: number; inr: number };
    perPiece: { weightGrams: number; usd: number; inr: number } | null;
  } | null;
}

function fmtCurrency(value: number, currency: 'INR' | 'USD'): string {
  if (currency === 'INR')
    return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PPM({ label, value }: { label: string; value: number | null }) {
  return (
    <span className={`font-mono text-[11px] ${value ? 'text-on-surface' : 'text-outline/40'}`}>
      <span className="text-[9px] text-outline font-bold">{label}</span>{' '}
      {value != null ? value.toLocaleString() : '—'}
    </span>
  );
}

export default function CartContent() {
  const { isAuthenticated, isLoading: authLoading, authFetch } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/v1/cart');
      if (res.ok) {
        const body = await res.json();
        setItems(body.data ?? []);
      }
    } catch {}
    setLoading(false);
  }, [authFetch]);

  useEffect(() => {
    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated, load]);

  useEffect(() => {
    authFetch('/api/v1/forex/rates')
      .then(r => r.ok ? r.json() : null)
      .then(body => { if (body?.data?.usdToInr) setCurrency('INR'); })
      .catch(() => {});
  }, []);

  const updateQty = async (cartItemId: number, qty: number) => {
    if (qty < 1) return;
    setUpdating(cartItemId);
    try {
      const res = await authFetch(`/api/v1/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: qty } : i));
      }
    } catch {}
    setUpdating(null);
  };

  const removeItem = async (cartItemId: number) => {
    setUpdating(cartItemId);
    try {
      const res = await authFetch(`/api/v1/cart/items/${cartItemId}`, { method: 'DELETE' });
      if (res.ok) setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
    } catch {}
    setUpdating(null);
  };

  const clearCart = async () => {
    try {
      const res = await authFetch('/api/v1/cart', { method: 'DELETE' });
      if (res.ok) setItems([]);
    } catch {}
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-surface pt-28 pb-20 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-surface pt-28 pb-20 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto text-center py-20">
          <ShoppingCart size={40} className="text-outline mx-auto mb-4" />
          <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Sign in to view your cart</h1>
          <p className="text-body-sm text-outline mb-6">Add catalytic converters to your cart and request quotes in bulk.</p>
          <Link href="/login" className="bg-primary text-on-primary text-label-caps font-label-caps px-6 py-3 hover:opacity-90 transition-opacity">
            SIGN IN
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-28 pb-20 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/catalog" className="text-[11px] text-outline hover:text-primary transition-colors flex items-center gap-1 mb-2">
              <ArrowLeft size={12} /> Back to catalog
            </Link>
            <h1 className="text-headline-md font-headline-md text-primary flex items-center gap-3">
              <ShoppingCart size={22} />
              Your Cart
              <span className="text-body-sm text-outline font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrency(c => c === 'USD' ? 'INR' : 'USD')}
              className="text-label-caps font-label-caps text-[10px] border border-outline-variant px-3 py-1.5 hover:bg-surface-container transition-colors"
            >
              {currency}
            </button>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-label-caps font-label-caps text-[10px] border border-error/30 text-error px-3 py-1.5 hover:bg-error/5 transition-colors"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant py-20 text-center">
            <ShoppingCart size={36} className="text-outline mx-auto mb-4" />
            <p className="text-body-sm text-on-surface-variant mb-1">Your cart is empty.</p>
            <p className="text-[11px] text-outline mb-6">Browse the catalog and add items to get started.</p>
            <Link href="/catalog" className="bg-primary text-on-primary text-label-caps font-label-caps px-6 py-2.5 hover:opacity-90 transition-opacity">
              BROWSE CATALOG
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const val = item.valuation;
              const price = val?.perPiece
                ? (currency === 'USD' ? val.perPiece.usd : val.perPiece.inr)
                : val?.perKg
                  ? (currency === 'USD' ? val.perKg.usd : val.perKg.inr)
                  : null;
              const priceLabel = val?.perPiece ? 'per piece' : 'per kg';
              const lineTotal = price != null ? price * item.quantity : null;
              const isUpdating = updating === item.cartItemId;

              return (
                <div key={item.cartItemId} className={`bg-surface-container-lowest border border-outline-variant flex flex-col sm:flex-row items-stretch transition-opacity ${isUpdating ? 'opacity-50' : ''}`}>
                  {/* Info */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/catalog/${item.catalystId}`} className="font-mono text-[15px] font-bold text-primary hover:underline">
                          {item.primaryCode}
                        </Link>
                        {item.secondaryCode && (
                          <span className="ml-2 font-mono text-[11px] text-outline">{item.secondaryCode}</span>
                        )}
                        <div className="text-[12px] text-on-surface-variant mt-0.5">{item.manufacturerBrand} · {item.catalystType}</div>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        disabled={isUpdating}
                        className="p-1.5 text-outline hover:text-error hover:border-error border border-outline-variant transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <PPM label="Pt" value={item.ptPpm} />
                      <PPM label="Pd" value={item.pdPpm} />
                      <PPM label="Rh" value={item.rhPpm} />
                      {item.weightPerPieceGrams && (
                        <span className="font-mono text-[11px] text-outline">
                          {item.weightPerPieceGrams.toLocaleString()}g
                        </span>
                      )}
                      <span className="text-[10px] text-outline">
                        Terms {item.terms ?? 70}%
                      </span>
                    </div>
                  </div>

                  {/* Quantity + price */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 px-4 py-3 sm:py-4 border-t sm:border-t-0 sm:border-l border-outline-variant bg-surface-container/30 sm:w-52">
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="w-8 h-8 border border-outline-variant flex items-center justify-center hover:bg-surface-container disabled:opacity-30 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 h-8 border-t border-b border-outline-variant flex items-center justify-center font-mono text-[13px] font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-right sm:text-center">
                      {price != null ? (
                        <>
                          <div className="font-mono text-[15px] font-bold text-on-surface">
                            {fmtCurrency(lineTotal!, currency)}
                          </div>
                          <div className="text-[10px] text-outline">
                            {fmtCurrency(price, currency)} {priceLabel}
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-outline">Price unavailable</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary bar */}
            <div className="bg-primary-container border border-outline-variant p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-label-caps font-label-caps text-on-primary-fixed-variant text-[10px]">
                  {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'} · {items.reduce((s, i) => s + i.quantity, 0)} UNITS TOTAL
                </p>
                <p className="text-[10px] text-on-primary-container mt-1">
                  Submit your cart as a bulk quote request. Our team will respond within 2 business hours.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/catalog"
                  className="text-label-caps font-label-caps text-[10px] border border-outline-variant px-4 py-2.5 hover:bg-surface-container transition-colors bg-surface-container-lowest"
                >
                  CONTINUE BROWSING
                </Link>
                <button
                  className="bg-primary text-on-primary text-label-caps font-label-caps px-6 py-2.5 hover:opacity-90 transition-opacity flex items-center gap-2"
                  onClick={() => alert('Bulk quote request coming soon!')}
                >
                  REQUEST BULK QUOTE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
