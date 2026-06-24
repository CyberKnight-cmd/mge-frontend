'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Types ────────────────────────────────────────────────────────────────────

type CatalystType = 'CERAMIC' | 'DPF' | 'CERAMIC_DPF' | 'FOIL' | 'SET' | 'STEEL' | 'OTHER';

interface Entry {
  id: number;
  manufacturer: string;
  manufacturerBrand: string;
  region: string | null;
  primaryCode: string;
  secondaryCode: string | null;
  catalystType: CatalystType;
  ptPpm: number | null;
  pdPpm: number | null;
  rhPpm: number | null;
  weightPerPieceGrams: number | null;
  terms: number | null;
  imageCount: number;
}

interface FormState {
  manufacturer: string;
  manufacturerBrand: string;
  region: string;
  primaryCode: string;
  secondaryCode: string;
  catalystType: CatalystType;
  ptPpm: string;
  pdPpm: string;
  rhPpm: string;
  weightPerPieceGrams: string;
  terms: string;
}

const TYPES: CatalystType[] = ['CERAMIC', 'DPF', 'CERAMIC_DPF', 'FOIL', 'SET', 'STEEL', 'OTHER'];
const TYPE_LABEL: Record<CatalystType, string> = {
  CERAMIC: 'Ceramic', DPF: 'DPF', CERAMIC_DPF: 'Ceramic+DPF',
  FOIL: 'Foil', SET: 'Set', STEEL: 'Steel', OTHER: 'Other',
};

const EMPTY_FORM: FormState = {
  manufacturer: '', manufacturerBrand: '', region: '',
  primaryCode: '', secondaryCode: '', catalystType: 'OTHER',
  ptPpm: '', pdPpm: '', rhPpm: '', weightPerPieceGrams: '', terms: '70',
};

function formFromEntry(e: Entry): FormState {
  return {
    manufacturer:       e.manufacturer,
    manufacturerBrand:  e.manufacturerBrand,
    region:             e.region ?? '',
    primaryCode:        e.primaryCode,
    secondaryCode:      e.secondaryCode ?? '',
    catalystType:       e.catalystType,
    ptPpm:              e.ptPpm != null ? String(e.ptPpm) : '',
    pdPpm:              e.pdPpm != null ? String(e.pdPpm) : '',
    rhPpm:              e.rhPpm != null ? String(e.rhPpm) : '',
    weightPerPieceGrams: e.weightPerPieceGrams != null ? String(e.weightPerPieceGrams) : '',
    terms: e.terms != null ? String(e.terms) : '70',
  };
}

function parseNum(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PPM({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <div className="text-[9px] text-outline font-bold">{label}</div>
      <div className={`font-mono text-[11px] font-bold ${value ? 'text-on-surface' : 'text-outline/40'}`}>
        {value != null ? value.toLocaleString() : '—'}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: CatalystType }) {
  const colors: Record<CatalystType, string> = {
    CERAMIC:     'bg-blue-50 text-blue-700 border-blue-200',
    DPF:         'bg-orange-50 text-orange-700 border-orange-200',
    CERAMIC_DPF: 'bg-purple-50 text-purple-700 border-purple-200',
    FOIL:        'bg-teal-50 text-teal-700 border-teal-200',
    SET:         'bg-green-50 text-green-700 border-green-200',
    STEEL:       'bg-gray-100 text-gray-700 border-gray-300',
    OTHER:       'bg-surface-container text-outline border-outline-variant',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${colors[type]}`}>
      {TYPE_LABEL[type]}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

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

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [key]: e.target.value });

  const inputCls = 'w-full bg-surface border border-outline-variant px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors';
  const labelCls = 'block text-label-caps font-label-caps text-[10px] text-outline mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-surface-container-lowest border border-outline-variant w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {mode === 'add' ? 'Add Catalog Entry' : 'Edit Catalog Entry'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-surface-container transition-colors text-outline hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/30 px-4 py-3 text-[13px] text-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Codes section */}
          <div>
            <p className="text-label-caps font-label-caps text-[10px] text-outline mb-3 border-b border-outline-variant pb-1">CATALOG CODES</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primary Code *</label>
                <input ref={firstInputRef} className={inputCls} value={form.primaryCode} onChange={set('primaryCode')} placeholder="e.g. G654" />
              </div>
              <div>
                <label className={labelCls}>Secondary Code</label>
                <input className={inputCls} value={form.secondaryCode} onChange={set('secondaryCode')} placeholder="e.g. CB15" />
              </div>
            </div>
          </div>

          {/* Manufacturer section */}
          <div>
            <p className="text-label-caps font-label-caps text-[10px] text-outline mb-3 border-b border-outline-variant pb-1">MANUFACTURER</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Manufacturer *</label>
                <input className={inputCls} value={form.manufacturer} onChange={set('manufacturer')} placeholder="e.g. MAZDA (TW)" />
              </div>
              <div>
                <label className={labelCls}>Brand</label>
                <input className={inputCls} value={form.manufacturerBrand} onChange={set('manufacturerBrand')} placeholder="e.g. MAZDA" />
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
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* PPM section */}
          <div>
            <p className="text-label-caps font-label-caps text-[10px] text-outline mb-3 border-b border-outline-variant pb-1">PGM CONTENT (PPM)</p>
            <div className="grid grid-cols-3 gap-4">
              {([['ptPpm', 'Platinum (Pt)'], ['pdPpm', 'Palladium (Pd)'], ['rhPpm', 'Rhodium (Rh)']] as const).map(([key, label]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input type="number" min="0" className={inputCls} value={form[key]} onChange={set(key)} placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          {/* Weight & Terms */}
          <div>
            <p className="text-label-caps font-label-caps text-[10px] text-outline mb-3 border-b border-outline-variant pb-1">PHYSICAL & TERMS</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Weight per Piece (grams)</label>
                <input type="number" min="0" className={inputCls} value={form.weightPerPieceGrams} onChange={set('weightPerPieceGrams')} placeholder="e.g. 850" />
              </div>
              <div>
                <label className={labelCls}>Terms (%)</label>
                <input type="number" min="0" max="100" step="0.1" className={inputCls} value={form.terms} onChange={set('terms')} placeholder="70" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant sticky bottom-0 bg-surface-container-lowest">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-outline-variant text-on-surface-variant text-label-caps font-label-caps hover:bg-surface-container transition-colors">
            CANCEL
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-on-primary text-label-caps font-label-caps hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'SAVING…' : mode === 'add' ? 'ADD ENTRY' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirm({
  entry, onConfirm, onCancel, deleting,
}: {
  entry: Entry;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
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
              This will permanently remove <span className="font-mono font-bold text-primary">{entry.primaryCode}</span> from the catalog. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onCancel} className="px-5 py-2 border border-outline-variant text-label-caps font-label-caps hover:bg-surface-container transition-colors">
            CANCEL
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2 bg-error text-white text-label-caps font-label-caps hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deleting ? 'DELETING…' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CatalogManager() {
  const router = useRouter();
  const { authFetch } = useAuth();

  const [entries, setEntries]         = useState<Entry[]>([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalItems, setTotalItems]   = useState(0);
  const [page, setPage]               = useState(0);
  const [q, setQ]                     = useState('');
  const [inputQ, setInputQ]           = useState('');
  const [loading, setLoading]         = useState(false);

  const [modal, setModal]             = useState<'add' | 'edit' | null>(null);
  const [form, setForm]               = useState<FormState>(EMPTY_FORM);
  const [editTarget, setEditTarget]   = useState<Entry | null>(null);
  const [saving, setSaving]           = useState(false);
  const [modalError, setModalError]   = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async (p: number, query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), size: '20' });
      if (query) params.set('q', query);
      const res  = await authFetch(`/api/v1/catalog/search?${params}`);
      const body = await res.json();
      if (body.success) {
        setEntries(body.data.content ?? []);
        setTotalPages(body.data.totalPages ?? 0);
        setTotalItems(body.data.totalElements ?? 0);
      }
    } catch {}
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { load(page, q); }, [page, q, load]);

  const search = () => { setPage(0); setQ(inputQ.trim()); };

  // ── Add / Edit modal ───────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModalError(null);
    setModal('add');
  };

  const openEdit = (e: Entry) => {
    setForm(formFromEntry(e));
    setEditTarget(e);
    setModalError(null);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setModalError(null); };

  const submitForm = async () => {
    if (!form.primaryCode.trim()) { setModalError('Primary code is required.'); return; }
    if (!form.manufacturer.trim()) { setModalError('Manufacturer is required.'); return; }

    setSaving(true);
    setModalError(null);
    try {
      const payload = {
        manufacturer:        form.manufacturer.trim(),
        manufacturerBrand:   form.manufacturerBrand.trim() || null,
        region:              form.region.trim() || null,
        primaryCode:         form.primaryCode.trim(),
        secondaryCode:       form.secondaryCode.trim() || null,
        catalystType:        form.catalystType,
        ptPpm:               parseNum(form.ptPpm),
        pdPpm:               parseNum(form.pdPpm),
        rhPpm:               parseNum(form.rhPpm),
        weightPerPieceGrams: parseNum(form.weightPerPieceGrams),
        terms:               parseNum(form.terms),
      };

      const url    = modal === 'add' ? '/api/v1/catalog' : `/api/v1/catalog/${editTarget!.id}`;
      const method = modal === 'add' ? 'POST' : 'PUT';

      const res  = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      if (!res.ok) {
        setModalError(body.message ?? `Error ${res.status}`);
      } else {
        closeModal();
        if (modal === 'add') {
          const newId = (body.data ?? body).id;
          router.push(`/catalog/${newId}`);
        } else {
          showToast('Entry updated.', true);
          load(page, q);
        }
      }
    } catch (e: any) {
      setModalError(e.message ?? 'Network error');
    }
    setSaving(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/v1/catalog/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteTarget(null);
        showToast('Entry deleted.', true);
        load(page, q);
      } else {
        const body = await res.json();
        showToast(body.message ?? 'Delete failed.', false);
        setDeleteTarget(null);
      }
    } catch {
      showToast('Network error.', false);
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 shadow-lg border text-[13px] font-semibold ${
          toast.ok
            ? 'bg-surface-container-lowest border-green-400 text-green-700'
            : 'bg-surface-container-lowest border-error text-error'
        }`}>
          {toast.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-headline-md font-headline-md text-primary">Catalog Manager</h1>
          <p className="text-body-sm text-outline mt-0.5">{totalItems.toLocaleString()} entries total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-on-primary text-label-caps font-label-caps px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          ADD ENTRY
        </button>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant pl-9 pr-4 py-2.5 text-[13px] focus:outline-none focus:border-primary transition-colors"
            placeholder="Search by code or brand…"
            value={inputQ}
            onChange={e => setInputQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        </div>
        <button onClick={search} className="px-5 py-2.5 bg-primary text-on-primary text-label-caps font-label-caps hover:opacity-90 transition-opacity">
          SEARCH
        </button>
        {q && (
          <button onClick={() => { setQ(''); setInputQ(''); setPage(0); }} className="px-4 py-2.5 border border-outline-variant text-outline hover:text-on-surface transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                {['PRIMARY CODE', 'SECONDARY', 'BRAND', 'TYPE', 'PT', 'PD', 'RH', 'WT (g)', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-label-caps font-label-caps text-[10px] text-outline whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-outline">
                    <div className="w-5 h-5 border-2 border-outline/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-outline text-body-sm">No entries found.</td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] font-bold text-primary">{e.primaryCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-outline">{e.secondaryCode || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-on-surface-variant">{e.manufacturerBrand}</td>
                    <td className="px-4 py-3"><TypeBadge type={e.catalystType} /></td>
                    <td className="px-4 py-3"><PPM label="Pt" value={e.ptPpm} /></td>
                    <td className="px-4 py-3"><PPM label="Pd" value={e.pdPpm} /></td>
                    <td className="px-4 py-3"><PPM label="Rh" value={e.rhPpm} /></td>
                    <td className="px-4 py-3 font-mono text-[11px] text-on-surface-variant">
                      {e.weightPerPieceGrams != null ? e.weightPerPieceGrams.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="p-1.5 border border-outline-variant text-outline hover:border-primary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(e)}
                          className="p-1.5 border border-outline-variant text-outline hover:border-error hover:text-error transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container">
            <span className="text-body-sm text-outline text-[11px]">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[12px] font-mono border transition-colors ${
                      p === page
                        ? 'bg-primary text-on-primary border-primary'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <EntryModal
          mode={modal}
          form={form}
          onChange={setForm}
          onSubmit={submitForm}
          onClose={closeModal}
          saving={saving}
          error={modalError}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          entry={deleteTarget}
          onConfirm={doDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
