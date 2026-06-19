'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

interface Suggestion {
  id: number;
  primaryCode: string;
  secondaryCode: string | null;
  manufacturer: string;
  manufacturerBrand: string;
  catalystType: string;
}

const TYPE_LABELS: Record<string, string> = {
  CERAMIC: 'Ceramic', DPF: 'DPF', CERAMIC_DPF: 'Ceramic+DPF',
  FOIL: 'Foil', SET: 'Set', STEEL: 'Steel', OTHER: 'Other',
};

interface Props {
  variant: 'hero' | 'navbar';
  onNavigate?: () => void;
}

export default function CatalogSearchBox({ variant, onNavigate }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) { setSuggestions([]); return; }
    setLoading(true);
    fetch(`/api/v1/catalog/search?q=${encodeURIComponent(debounced)}&size=6&page=0`)
      .then(r => r.json())
      .then(b => setSuggestions(b.data?.content ?? []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setActiveIdx(-1); }, [suggestions]);

  const navigate = useCallback((id: number) => {
    setOpen(false);
    setQuery('');
    setSuggestions([]);
    onNavigate?.();
    router.push(`/catalog/${id}`);
  }, [router, onNavigate]);

  const submitSearch = useCallback(() => {
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      navigate(suggestions[activeIdx].id);
    } else if (query.trim()) {
      setOpen(false);
      setQuery('');
      setSuggestions([]);
      onNavigate?.();
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  }, [activeIdx, suggestions, query, navigate, router, onNavigate]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && (suggestions.length > 0 || loading) && debounced.length > 0;

  if (variant === 'hero') {
    return (
      <div ref={containerRef} className="relative max-w-2xl mx-auto">
        <div className="backdrop-blur-md bg-white/10 border border-white/25 flex flex-col md:flex-row shadow-2xl">
          <div className="flex items-center flex-1 px-5 py-4 gap-3">
            <Search size={18} className="text-white/50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
              onKeyDown={onKeyDown}
              placeholder="Search by code or brand  (e.g. G654, TOYOTA)"
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-white placeholder:text-white/40 text-body-md font-mono"
            />
            {loading && <Loader2 size={16} className="text-white/40 animate-spin shrink-0" />}
          </div>
          <button
            type="button"
            onClick={submitSearch}
            className="bg-white text-primary font-label-caps font-bold px-8 py-4 hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            SEARCH
          </button>
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant shadow-2xl z-50 max-h-80 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => navigate(s.id)}
                className={`w-full text-left px-5 py-3 flex items-center justify-between gap-4 transition-colors border-b border-outline-variant last:border-0 ${
                  i === activeIdx ? 'bg-primary/10' : 'hover:bg-surface-container'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-mono text-[14px] font-bold text-primary truncate">{s.primaryCode}</div>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    {s.manufacturerBrand}{s.secondaryCode ? ` · ${s.secondaryCode}` : ''}
                  </div>
                </div>
                <span className="text-[10px] text-label-caps font-label-caps text-outline border border-outline-variant px-1.5 py-0.5 shrink-0">
                  {TYPE_LABELS[s.catalystType] ?? s.catalystType}
                </span>
              </button>
            ))}
            {loading && suggestions.length === 0 && (
              <div className="flex items-center gap-2 px-5 py-3 text-[12px] text-outline">
                <Loader2 size={12} className="animate-spin" /> Searching…
              </div>
            )}
            {!loading && suggestions.length === 0 && debounced && (
              <div className="px-5 py-3 text-[12px] text-outline">No results for &ldquo;{debounced}&rdquo;</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // variant === 'navbar'
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder="Search codes…"
          className="bg-surface-container-low border border-outline-variant pl-8 pr-4 py-1.5 text-body-sm w-52 focus:w-72 focus:outline-none focus:border-primary placeholder:text-outline-variant transition-all duration-300"
        />
        {loading && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline animate-spin" />}
      </div>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-surface-container-lowest border border-outline-variant shadow-xl z-50 max-h-72 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => navigate(s.id)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors border-b border-outline-variant last:border-0 ${
                i === activeIdx ? 'bg-primary/10' : 'hover:bg-surface-container'
              }`}
            >
              <div className="min-w-0">
                <div className="font-mono text-[13px] font-bold text-primary truncate">{s.primaryCode}</div>
                <div className="text-[10px] text-on-surface-variant truncate">
                  {s.manufacturerBrand}{s.secondaryCode ? ` · ${s.secondaryCode}` : ''}
                </div>
              </div>
              <span className="text-[9px] text-label-caps font-label-caps text-outline border border-outline-variant px-1.5 py-0.5 shrink-0">
                {TYPE_LABELS[s.catalystType] ?? s.catalystType}
              </span>
            </button>
          ))}
          {loading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 text-[12px] text-outline">
              <Loader2 size={12} className="animate-spin" /> Searching…
            </div>
          )}
          {!loading && suggestions.length === 0 && debounced && (
            <div className="px-4 py-2.5 text-[12px] text-outline">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
