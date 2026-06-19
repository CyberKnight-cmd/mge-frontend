'use client';

import { useState, useEffect, useRef, Suspense, useCallback, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search, ChevronRight, ChevronLeft, X, Loader2,
  Plus, Pencil, Trash2, AlertCircle, CheckCircle2, ChevronsUpDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────

type CatalystType = 'CERAMIC' | 'DPF' | 'CERAMIC_DPF' | 'FOIL' | 'SET' | 'STEEL' | 'OTHER';

interface CatalystSearchResult {
  id: number;
  manufacturer: string;
  manufacturerBrand: string;
  region: string | null;
  primaryCode: string;
  secondaryCode: string | null;
  secondaryCode2: string | null;
  catalystType: CatalystType;
  ptPpm: number | null;
  pdPpm: number | null;
  rhPpm: number | null;
  weightPerPieceGrams: number | null;
}

interface SpringPage {
  content: CatalystSearchResult[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface FormState {
  manufacturer: string;
  manufacturerBrand: string;
  region: string;
  primaryCode: string;
  secondaryCode: string;
  secondaryCode2: string;
  catalystType: CatalystType;
  ptPpm: string;
  pdPpm: string;
  rhPpm: string;
  weightPerPieceGrams: string;
}

// ── Display helpers ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<CatalystType, string> = {
  CERAMIC: 'Ceramic', DPF: 'DPF', CERAMIC_DPF: 'Ceramic+DPF',
  FOIL: 'Foil', SET: 'Set', STEEL: 'Steel', OTHER: 'Other',
};

const TYPE_COLORS: Record<CatalystType, string> = {
  CERAMIC:     'bg-blue-50 text-blue-700 border-blue-200',
  DPF:         'bg-orange-50 text-orange-700 border-orange-200',
  CERAMIC_DPF: 'bg-purple-50 text-purple-700 border-purple-200',
  FOIL:        'bg-teal-50 text-teal-700 border-teal-200',
  SET:         'bg-green-50 text-green-700 border-green-200',
  STEEL:       'bg-gray-100 text-gray-700 border-gray-300',
  OTHER:       'bg-surface-container text-on-surface-variant border-outline-variant',
};

const CATALYST_TYPES: CatalystType[] = ['CERAMIC','DPF','CERAMIC_DPF','FOIL','SET','STEEL','OTHER'];

const EMPTY_FORM: FormState = {
  manufacturer: '', manufacturerBrand: '', region: '',
  primaryCode: '', secondaryCode: '', secondaryCode2: '', catalystType: 'OTHER',
  ptPpm: '', pdPpm: '', rhPpm: '', weightPerPieceGrams: '',
};

function formFrom(e: CatalystSearchResult): FormState {
  return {
    manufacturer:        e.manufacturer,
    manufacturerBrand:   e.manufacturerBrand,
    region:              e.region ?? '',
    primaryCode:         e.primaryCode,
    secondaryCode:       e.secondaryCode ?? '',
    secondaryCode2:      e.secondaryCode2 ?? '',
    catalystType:        e.catalystType,
    ptPpm:               e.ptPpm != null ? String(e.ptPpm) : '',
    pdPpm:               e.pdPpm != null ? String(e.pdPpm) : '',
    rhPpm:               e.rhPpm != null ? String(e.rhPpm) : '',
    weightPerPieceGrams: e.weightPerPieceGrams != null ? String(e.weightPerPieceGrams) : '',
  };
}

function PPMCell({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="text-center min-w-[36px]">
      <div className="text-[9px] text-outline mb-0.5 font-bold">{label}</div>
      <div className={`font-mono text-[12px] font-bold ${value != null ? 'text-on-surface' : 'text-outline/40'}`}>
        {value != null ? value.toFixed(0) : '—'}
      </div>
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-outline-variant animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-3.5 bg-surface-container-high rounded-sm" style={{ width: [10,80,56,64,48,72,32,32,32,40,60][i] ?? 40 }} />
        </td>
      ))}
    </tr>
  );
}

// ── Manufacturer combobox ─────────────────────────────────────────────────

function ManufacturerCombobox({ value, onChange }: {
  value: string;
  onChange: (mfr: string, brand: string) => void;
}) {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState(value);
  const [options, setOptions]     = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);

  // Sync display text when value changes from outside (e.g. edit pre-fill)
  useEffect(() => { setQuery(value); }, [value]);

  // Fetch all manufacturers once when first opened
  useEffect(() => {
    if (!open || options.length > 0) return;
    setLoading(true);
    fetch('/api/v1/catalog/manufacturers')
      .then(r => r.json())
      .then(b => setOptions(b.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const exactMatch = options.some(o => o.toLowerCase() === query.trim().toLowerCase());

  const deriveBrand = (mfr: string) => {
    const idx = mfr.indexOf('(');
    return idx > 0 ? mfr.substring(0, idx).trim() : mfr.trim();
  };

  const select = (mfr: string) => {
    setQuery(mfr);
    setOpen(false);
    onChange(mfr, deriveBrand(mfr));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="w-full bg-surface border border-outline-variant flex items-center cursor-pointer focus-within:border-primary transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <input
          className="flex-1 px-3 py-2 text-[13px] bg-transparent focus:outline-none"
          placeholder="e.g. TATA (IND)"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onClick={e => { e.stopPropagation(); setOpen(true); }}
        />
        <ChevronsUpDown size={13} className="mr-2 text-outline shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 bg-surface-container-lowest border border-outline-variant border-t-0 shadow-xl max-h-52 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-outline">
              <Loader2 size={12} className="animate-spin" /> Loading…
            </div>
          )}

          {filtered.map(o => (
            <button key={o} type="button" onClick={() => select(o)}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-container transition-colors ${
                o === value ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'
              }`}>
              {o}
            </button>
          ))}

          {/* "Add new" option — shown when typed value doesn't match any existing one */}
          {query.trim() && !exactMatch && (
            <button type="button" onClick={() => select(query.trim())}
              className="w-full text-left px-3 py-2.5 text-[13px] border-t border-outline-variant text-primary font-semibold hover:bg-primary/5 transition-colors flex items-center gap-2">
              <Plus size={13} />
              Add &ldquo;{query.trim()}&rdquo; as new manufacturer
            </button>
          )}

          {!loading && filtered.length === 0 && !query.trim() && (
            <div className="px-3 py-2 text-[12px] text-outline">No manufacturers yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Entry modal ────────────────────────────────────────────────────────────

function EntryModal({
  mode, form, onChange, onSubmit, onClose, saving, error,
}: {
  mode: 'add' | 'edit';
  form: FormState;
  onChange: (f: FormState) => void;
  onSubmit: () => void;
  onClose: () => void;
  saving: boolean;
  error: string | null;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstInputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (!saving) onSubmit(); };

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...form, [key]: e.target.value });

  const inputCls = 'w-full bg-surface border border-outline-variant px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors';
  const labelCls = 'block text-label-caps font-label-caps text-[10px] text-outline mb-1';

  const onManufacturerChange = (mfr: string, brand: string) =>
    onChange({ ...form, manufacturer: mfr, manufacturerBrand: brand });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-surface-container-lowest border border-outline-variant w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {mode === 'add' ? 'Add Catalog Entry' : 'Edit Catalog Entry'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-surface-container transition-colors text-outline">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/30 px-4 py-3 text-[13px] text-error">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <div>
            <p className={labelCls + ' border-b border-outline-variant pb-1 mb-3'}>CATALOG CODES</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Primary Code *</label>
                <input ref={firstInputRef} className={inputCls} value={form.primaryCode} onChange={set('primaryCode')} placeholder="e.g. G654" />
              </div>
              <div>
                <label className={labelCls}>Secondary Code 1</label>
                <input className={inputCls} value={form.secondaryCode} onChange={set('secondaryCode')} placeholder="e.g. CB15" />
              </div>
              <div>
                <label className={labelCls}>Secondary Code 2</label>
                <input className={inputCls} value={form.secondaryCode2} onChange={set('secondaryCode2')} placeholder="e.g. 8509241" />
              </div>
            </div>
          </div>

          <div>
            <p className={labelCls + ' border-b border-outline-variant pb-1 mb-3'}>MANUFACTURER</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Manufacturer *</label>
                <ManufacturerCombobox value={form.manufacturer} onChange={onManufacturerChange} />
                <p className="text-[10px] text-outline mt-1">Format: BRAND (REGION) — e.g. TATA (IND)</p>
              </div>
              <div>
                <label className={labelCls}>Brand (auto-filled)</label>
                <input className={inputCls} value={form.manufacturerBrand} onChange={set('manufacturerBrand')} placeholder="e.g. TATA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelCls}>Region</label>
                <input className={inputCls} value={form.region} onChange={set('region')} placeholder="e.g. TW, EU, IN" />
              </div>
              <div>
                <label className={labelCls}>Type *</label>
                <select className={inputCls} value={form.catalystType} onChange={set('catalystType')}>
                  {CATALYST_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className={labelCls + ' border-b border-outline-variant pb-1 mb-3'}>PGM CONTENT (PPM)</p>
            <div className="grid grid-cols-3 gap-4">
              {([['ptPpm','Platinum (Pt)'],['pdPpm','Palladium (Pd)'],['rhPpm','Rhodium (Rh)']] as const).map(([key, lbl]) => (
                <div key={key}>
                  <label className={labelCls}>{lbl}</label>
                  <input type="number" min="0" className={inputCls} value={form[key]} onChange={set(key)} placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className={labelCls + ' border-b border-outline-variant pb-1 mb-3'}>PHYSICAL</p>
            <div className="w-1/2 pr-2">
              <label className={labelCls}>Weight per Piece (grams)</label>
              <input type="number" min="0" className={inputCls} value={form.weightPerPieceGrams} onChange={set('weightPerPieceGrams')} placeholder="e.g. 850" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant sticky bottom-0 bg-surface-container-lowest">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-outline-variant text-label-caps font-label-caps hover:bg-surface-container transition-colors">
            CANCEL
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-primary text-on-primary text-label-caps font-label-caps hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'SAVING…' : mode === 'add' ? 'ADD ENTRY' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────────────────

function DeleteConfirm({ entry, onConfirm, onCancel, deleting }: {
  entry: CatalystSearchResult; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { confirmRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest border border-error/40 w-full max-w-md shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={22} className="text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-on-surface mb-1">Delete Entry?</h3>
            <p className="text-body-sm text-on-surface-variant">
              Permanently remove <span className="font-mono font-bold text-primary">{entry.primaryCode}</span> from the catalog. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onCancel} className="px-5 py-2 border border-outline-variant text-label-caps font-label-caps hover:bg-surface-container transition-colors">CANCEL</button>
          <button ref={confirmRef} onClick={onConfirm} disabled={deleting}
            className="px-5 py-2 bg-error text-white text-label-caps font-label-caps hover:opacity-90 disabled:opacity-50">
            {deleting ? 'DELETING…' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main inner component ───────────────────────────────────────────────────

function CatalogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeFilter = searchParams.get('type') as CatalystType | null;
  const initialQ = searchParams.get('q') ?? '';
  const { user, authFetch } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Search / table state
  const [inputValue, setInputValue]         = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions]       = useState<CatalystSearchResult[]>([]);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [results, setResults]               = useState<CatalystSearchResult[]>([]);
  const [totalElements, setTotalElements]   = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [page, setPage]                     = useState(0);
  const [tableLoading, setTableLoading]     = useState(true);
  const [refreshKey, setRefreshKey]         = useState(0);

  // Admin CRUD state
  const [modal, setModal]           = useState<'add' | 'edit' | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState<CatalystSearchResult | null>(null);
  const [saving, setSaving]         = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalystSearchResult | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, ok: boolean) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ── Debounce input ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  // ── Suggestions ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery) { setSuggestions([]); return; }
    setSuggestLoading(true);
    const p = new URLSearchParams({ q: debouncedQuery, size: '6', page: '0' });
    if (typeFilter) p.set('type', typeFilter);
    fetch(`/api/v1/catalog/search?${p}`)
      .then(r => r.json()).then(j => setSuggestions(j.data?.content ?? []))
      .catch(() => setSuggestions([])).finally(() => setSuggestLoading(false));
  }, [debouncedQuery, typeFilter]);

  // ── Table results ─────────────────────────────────────────────────────────
  useEffect(() => {
    setTableLoading(true);
    const p = new URLSearchParams({ size: '20', page: String(page) });
    if (debouncedQuery) p.set('q', debouncedQuery);
    if (typeFilter)     p.set('type', typeFilter);
    fetch(`/api/v1/catalog/search?${p}`)
      .then(r => r.json()).then(j => {
        const data: SpringPage = j.data;
        setResults(data?.content ?? []);
        setTotalElements(data?.totalElements ?? 0);
        setTotalPages(data?.totalPages ?? 0);
      })
      .catch(() => { setResults([]); setTotalElements(0); })
      .finally(() => setTableLoading(false));
  }, [debouncedQuery, typeFilter, page, refreshKey]);

  useEffect(() => { setPage(0); }, [debouncedQuery, typeFilter]);

  // ── Outside click closes dropdown ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current?.contains(e.target as Node) || inputRef.current?.contains(e.target as Node)) return;
      setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearSearch = () => { setInputValue(''); setSuggestions([]); setShowDropdown(false); inputRef.current?.focus(); };

  const paginationPages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    if (page <= 3)              return [0,1,2,3,4,5,6];
    if (page >= totalPages - 4) return Array.from({ length: 7 }, (_, i) => totalPages - 7 + i);
    return Array.from({ length: 7 }, (_, i) => page - 3 + i);
  })();

  // ── Admin: open add/edit modal ─────────────────────────────────────────────
  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalError(null); setModal('add'); };
  const openEdit = (e: CatalystSearchResult) => { setForm(formFrom(e)); setEditTarget(e); setModalError(null); setModal('edit'); };
  const closeModal = () => { setModal(null); setModalError(null); };

  const submitForm = async () => {
    if (!form.primaryCode.trim())  { setModalError('Primary code is required.'); return; }
    if (!form.manufacturer.trim()) { setModalError('Manufacturer is required.'); return; }
    setSaving(true); setModalError(null);
    try {
      const payload = {
        manufacturer:        form.manufacturer.trim(),
        manufacturerBrand:   form.manufacturerBrand.trim() || null,
        region:              form.region.trim() || null,
        primaryCode:         form.primaryCode.trim(),
        secondaryCode:       form.secondaryCode.trim() || null,
        secondaryCode2:      form.secondaryCode2.trim() || null,
        catalystType:        form.catalystType,
        ptPpm:               form.ptPpm   ? parseFloat(form.ptPpm)   : null,
        pdPpm:               form.pdPpm   ? parseFloat(form.pdPpm)   : null,
        rhPpm:               form.rhPpm   ? parseFloat(form.rhPpm)   : null,
        weightPerPieceGrams: form.weightPerPieceGrams ? parseFloat(form.weightPerPieceGrams) : null,
      };
      const url    = modal === 'add' ? '/api/v1/catalog' : `/api/v1/catalog/${editTarget!.id}`;
      const method = modal === 'add' ? 'POST' : 'PUT';
      const res    = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body   = await res.json();
      if (!res.ok) { setModalError(body.message ?? `Error ${res.status}`); }
      else if (modal === 'add') { closeModal(); router.push(`/catalog/${(body.data ?? body).id}`); }
      else { closeModal(); showToast('Entry updated.', true); setRefreshKey(k => k + 1); }
    } catch (e: any) { setModalError(e.message ?? 'Network error'); }
    setSaving(false);
  };

  // ── Admin: delete ──────────────────────────────────────────────────────────
  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/v1/catalog/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Entry deleted.', true); setRefreshKey(k => k + 1); }
      else        { const b = await res.json(); showToast(b.message ?? 'Delete failed.', false); }
    } catch { showToast('Network error.', false); }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const colCount = isAdmin ? 10 : 9;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex">
      <Sidebar />
      <div className="lg:ml-[240px] w-full min-h-[calc(100vh-64px)]">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 shadow-lg border text-[13px] font-semibold ${
            toast.ok ? 'bg-surface-container-lowest border-green-400 text-green-700' : 'bg-surface-container-lowest border-error text-error'
          }`}>
            {toast.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* Page header */}
        <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-5">
          <div className="flex items-center gap-2 text-label-caps font-label-caps text-secondary mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-primary">Catalog</span>
            {typeFilter && (<><ChevronRight size={12} /><span className="text-primary">{TYPE_LABELS[typeFilter]}</span></>)}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-headline-lg font-headline-lg text-primary">
                {typeFilter ? `${TYPE_LABELS[typeFilter]} Converters` : 'Converter Catalog'}
              </h1>
              <p className="text-body-md text-secondary mt-1">
                {tableLoading ? 'Loading catalog…' : `${totalElements.toLocaleString()} entries${debouncedQuery ? ` for "${debouncedQuery}"` : ''}`}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mt-4 max-w-2xl" ref={dropRef}>
            <div className="flex items-center bg-surface-container-lowest border border-outline-variant focus-within:border-primary transition-colors">
              <Search size={16} className="ml-4 text-outline shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setShowDropdown(true); }}
                onFocus={() => { if (inputValue) setShowDropdown(true); }}
                onKeyDown={e => { if (e.key === 'Escape') setShowDropdown(false); }}
                placeholder="Search by code — e.g. 8509241, G654, KSN70…"
                className="flex-1 px-3 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none text-body-md font-mono placeholder:font-sans placeholder:text-outline"
              />
              {suggestLoading && <Loader2 size={14} className="mr-3 text-outline animate-spin shrink-0" />}
              {inputValue && !suggestLoading && (
                <button onClick={clearSearch} className="mr-3 text-outline hover:text-primary transition-colors shrink-0"><X size={14} /></button>
              )}
            </div>

            <AnimatePresence>
              {showDropdown && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 z-50 bg-surface-container-lowest border border-outline-variant border-t-0 shadow-lg"
                >
                  {suggestions.map(s => (
                    <Link key={s.id} href={`/catalog/${s.id}`} onClick={() => setShowDropdown(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors border-b border-outline-variant last:border-0 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 border shrink-0 ${TYPE_COLORS[s.catalystType]}`}>{TYPE_LABELS[s.catalystType]}</span>
                        <span className="font-mono text-[13px] font-bold text-primary truncate">{s.primaryCode}</span>
                        {s.secondaryCode && <span className="font-mono text-[11px] text-outline hidden sm:inline truncate">↳ {s.secondaryCode}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[11px] text-outline hidden md:inline">{s.manufacturerBrand}{s.region ? ` · ${s.region}` : ''}</span>
                        <ChevronRight size={12} className="text-outline group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                  {totalElements > 6 && (
                    <div className="px-4 py-2 bg-surface-container text-[10px] text-outline font-bold">
                      Showing top 6 of {totalElements.toLocaleString()} matches — scroll down for all results
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="p-margin-mobile md:p-margin-desktop">
          <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">

            {/* Table header bar */}
            <div className="bg-primary text-on-primary px-6 py-3 flex justify-between items-center">
              <h4 className="text-label-caps font-label-caps tracking-widest">
                {typeFilter ? TYPE_LABELS[typeFilter].toUpperCase() : 'ALL CONVERTERS'}
              </h4>
              <div className="flex items-center gap-4">
                <span className="text-[11px] opacity-70">{tableLoading ? 'Loading…' : `${totalElements.toLocaleString()} total`}</span>
                {isAdmin && (
                  <button onClick={openAdd}
                    className="flex items-center gap-1.5 bg-on-primary text-primary text-label-caps font-label-caps px-3 py-1 hover:opacity-80 transition-opacity text-[11px]">
                    <Plus size={12} /> ADD ENTRY
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-container">
                  <tr>
                    {[
                      { label: '#',            cls: 'w-10' },
                      { label: 'PRIMARY CODE', cls: '' },
                      { label: 'TYPE',         cls: '' },
                      { label: 'MANUFACTURER', cls: '' },
                      { label: 'REGION',       cls: '' },
                      { label: 'ALT CODE',     cls: '' },
                      { label: 'Pt',           cls: 'text-center' },
                      { label: 'Pd',           cls: 'text-center' },
                      { label: 'Rh',           cls: 'text-center' },
                      ...(isAdmin ? [{ label: '', cls: 'w-20' }] : []),
                    ].map(({ label, cls }, i) => (
                      <th key={label + i} className={`p-3 border-b border-outline-variant text-label-caps font-label-caps text-[10px] text-on-secondary-fixed-variant whitespace-nowrap ${cls}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="py-20 text-center text-on-surface-variant text-body-md">
                        {debouncedQuery ? `No converters found for "${debouncedQuery}".` : 'No converters found.'}
                      </td>
                    </tr>
                  ) : (
                    results.map((row, idx) => (
                      <motion.tr key={row.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: idx * 0.025 }}
                        onClick={() => router.push(`/catalog/${row.id}`)}
                        className={`border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                        <td className="p-3 text-outline font-mono text-[12px]">{(page * 20 + idx + 1).toString().padStart(2, '0')}</td>
                        <td className="p-3 font-mono text-[13px] font-bold text-primary whitespace-nowrap">{row.primaryCode}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 border whitespace-nowrap ${TYPE_COLORS[row.catalystType]}`}>
                            {TYPE_LABELS[row.catalystType]}
                          </span>
                        </td>
                        <td className="p-3 text-body-md whitespace-nowrap">{row.manufacturerBrand}</td>
                        <td className="p-3 text-body-md text-on-surface-variant whitespace-nowrap">{row.region ?? '—'}</td>
                        <td className="p-3 font-mono text-[12px] text-on-surface-variant whitespace-nowrap">{row.secondaryCode ?? '—'}</td>
                        <td className="p-3"><PPMCell value={row.ptPpm} label="Pt" /></td>
                        <td className="p-3"><PPMCell value={row.pdPpm} label="Pd" /></td>
                        <td className="p-3"><PPMCell value={row.rhPpm} label="Rh" /></td>
                        {isAdmin && (
                          <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => openEdit(row)}
                                className="p-1.5 border border-outline-variant text-outline hover:border-primary hover:text-primary transition-colors" title="Edit">
                                <Pencil size={11} />
                              </button>
                              <button onClick={() => setDeleteTarget(row)}
                                className="p-1.5 border border-outline-variant text-outline hover:border-error hover:text-error transition-colors" title="Delete">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-surface-container px-6 py-3 flex justify-between items-center border-t border-outline-variant">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-1 text-label-caps font-label-caps text-[11px] disabled:opacity-30 hover:text-primary transition-colors">
                  <ChevronLeft size={13} /> PREV
                </button>
                <div className="flex gap-1">
                  {paginationPages.map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center border text-body-sm transition-colors ${
                        p === page ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:bg-surface-container-low'
                      }`}>
                      {p + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 text-label-caps font-label-caps text-[11px] disabled:opacity-30 hover:text-primary transition-colors">
                  NEXT <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <EntryModal mode={modal} form={form} onChange={setForm}
          onSubmit={submitForm} onClose={closeModal} saving={saving} error={modalError} />
      )}
      {deleteTarget && (
        <DeleteConfirm entry={deleteTarget} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}
    </div>
  );
}

export default function CatalogContent() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 size={24} className="animate-spin text-outline" /></div>}>
      <CatalogInner />
    </Suspense>
  );
}
