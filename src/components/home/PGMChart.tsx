'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

type Period = '1D' | '1W' | '1M' | 'YTD';

interface ChartPoint {
  label:   string;
  pt:      number | null;
  pd:      number | null;
  rh:      number | null;
  ptPrice: number | null;
  pdPrice: number | null;
  rhPrice: number | null;
}

interface SpotMetal {
  displaySymbol: string;
  name:          string;
  priceUsd:      number | null;
  changePct:     number | null;
  live:          boolean;
  note?:         string;
}

interface HistoryBody {
  points:   any[];
  partial:  boolean;
  coverage: number;
}

// ── Colors ──────────────────────────────────────────────────────────────────
const PT_COLOR = '#f87171';   // red-400
const PD_COLOR = '#4ade80';   // green-400
const RH_COLOR = '#60a5fa';   // blue-400

// ── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as ChartPoint;

  const rows: { color: string; symbol: string; price: number | null; index: number | null }[] = [
    { color: PT_COLOR, symbol: 'PT',  price: point.ptPrice, index: point.pt },
    { color: PD_COLOR, symbol: 'PD',  price: point.pdPrice, index: point.pd },
    { color: RH_COLOR, symbol: 'RH',  price: point.rhPrice, index: point.rh },
  ].filter(r => r.price != null || r.index != null);

  return (
    <div className="bg-[#1a1f2e] border border-white/15 p-3 backdrop-blur-md shadow-xl min-w-[180px]">
      <p className="text-[10px] text-white/50 font-mono mb-2 border-b border-white/10 pb-1">{label}</p>
      {rows.map(r => (
        <div key={r.symbol} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: r.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: r.color }} />
            {r.symbol}
          </span>
          <span className="font-mono text-[12px] font-bold text-white">
            {r.price != null
              ? '$' + r.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '—'}
            {r.index != null && (
              <span className={`ml-1.5 text-[10px] font-normal ${
                r.index > 100 ? 'text-green-400' : r.index < 100 ? 'text-red-400' : 'text-white/40'
              }`}>
                ({(r.index - 100) >= 0 ? '+' : ''}{(r.index - 100).toFixed(2)}%)
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export default function PGMChart() {
  const [period, setPeriod]           = useState<Period>('1M');
  const [chartData, setChartData]     = useState<ChartPoint[]>([]);
  const [spots, setSpots]             = useState<SpotMetal[]>([]);
  const [syncTime, setSyncTime]       = useState('—');
  const [chartLoading, setChartLoading] = useState(true);
  const [partial, setPartial]         = useState(false);
  const [coverage, setCoverage]       = useState(100);

  const fetchPrices = useCallback(async () => {
    try {
      const res  = await fetch('/api/v1/metals/prices');
      const body = await res.json();
      if (body.success && body.data) {
        setSpots(body.data.prices ?? []);
        setSyncTime(new Date(body.data.fetchedAt).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        }));
      }
    } catch {}
  }, []);

  const fetchHistory = useCallback(async (p: Period) => {
    setChartLoading(true);
    try {
      const res  = await fetch(`/api/v1/metals/history?period=${p}`);
      const body = await res.json();
      if (body.success && body.data) {
        const d: HistoryBody = body.data;
        setChartData((d.points ?? []).map((pt: any) => ({
          label:   pt.label,
          pt:      pt.ptIndex   ?? null,
          pd:      pt.pdIndex   ?? null,
          rh:      pt.rhIndex   ?? null,
          ptPrice: pt.ptPrice   ?? null,
          pdPrice: pt.pdPrice   ?? null,
          rhPrice: pt.rhPrice   ?? null,
        })));
        setPartial(d.partial ?? false);
        setCoverage(d.coverage ?? 100);
      } else {
        setChartData([]);
      }
    } catch {
      setChartData([]);
    }
    setChartLoading(false);
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  useEffect(() => { fetchHistory(period); }, [period, fetchHistory]);

  const pt = spots.find(s => s.displaySymbol === 'Pt');
  const pd = spots.find(s => s.displaySymbol === 'Pd');
  const rh = spots.find(s => s.displaySymbol === 'Rh');

  const hasRh = chartData.some(d => d.rh != null);

  const xAxisInterval: Record<Period, number> = {
    '1D':  3,  // every 4 h  → ~6 labels
    '1W':  0,  // all 7 days
    '1M':  4,  // every 5 d  → ~6 labels
    'YTD': 3,  // every 4 wk → ~13 labels (monthly)
  };

  return (
    <div className="bg-primary-container border border-white/10 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-primary">Live PGM Performance</h3>
          <p className="text-body-sm text-on-primary-container mt-0.5">
            % change from period start · kitco.com
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['1D', '1W', '1M', 'YTD'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-label-caps font-label-caps border transition-colors ${
                period === p
                  ? 'bg-on-primary text-primary border-on-primary'
                  : 'border-white/20 text-on-primary-container hover:border-white/40 hover:text-on-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Spot prices */}
      <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
        {[
          { metal: pt, name: 'PLATINUM',  color: PT_COLOR },
          { metal: pd, name: 'PALLADIUM', color: PD_COLOR },
          { metal: rh, name: 'RHODIUM',   color: RH_COLOR },
        ].map(({ metal, name, color }) => (
          <div key={name} className="px-5 py-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <p className="text-label-caps font-label-caps text-on-primary-container text-[10px]">{name}</p>
            </div>
            {metal?.live ? (
              <>
                <p className="font-mono text-[18px] font-bold text-on-primary">
                  ${(metal.priceUsd ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2, maximumFractionDigits: 2,
                  })}
                </p>
                <p className={`text-[11px] font-bold font-mono ${
                  (metal.changePct ?? 0) > 0 ? 'text-green-400'
                  : (metal.changePct ?? 0) < 0 ? 'text-red-400'
                  : 'text-on-primary-container'
                }`}>
                  {(metal.changePct ?? 0) > 0 ? '+' : ''}
                  {metal.changePct != null ? `${metal.changePct.toFixed(2)}%` : '—'}
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[14px] font-bold text-on-primary-container mt-0.5 opacity-50">OTC</p>
                <p className="text-[9px] text-on-primary-container opacity-35 leading-tight mt-0.5">
                  Not exchange-listed
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[280px] px-2 py-4">
        {chartLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-on-primary-container opacity-40 text-body-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
              <defs>
                {[
                  { id: 'ptGrad', color: PT_COLOR },
                  { id: 'pdGrad', color: PD_COLOR },
                  { id: 'rhGrad', color: RH_COLOR },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0}  />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <ReferenceLine y={100} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

              <XAxis
                dataKey="label"
                tick={{ fill: '#778598', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={xAxisInterval[period]}
              />
              <YAxis
                tickFormatter={(v) => `${(v - 100) >= 0 ? '+' : ''}${(v - 100).toFixed(1)}%`}
                tick={{ fill: '#778598', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />

              <Area
                type="monotone"
                dataKey="pt"
                name="Pt"
                stroke={PT_COLOR}
                strokeWidth={2}
                fill="url(#ptGrad)"
                dot={false}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="pd"
                name="Pd"
                stroke={PD_COLOR}
                strokeWidth={2}
                fill="url(#pdGrad)"
                dot={false}
                connectNulls={false}
              />
              {hasRh && (
                <Area
                  type="monotone"
                  dataKey="rh"
                  name="Rh"
                  stroke={RH_COLOR}
                  strokeWidth={2}
                  fill="url(#rhGrad)"
                  dot={false}
                  connectNulls={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-on-primary-container">
            {[
              { color: PT_COLOR, label: 'Platinum' },
              { color: PD_COLOR, label: 'Palladium' },
              { color: RH_COLOR, label: hasRh ? 'Rhodium' : 'Rhodium (building…)' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-5 h-[2px] inline-block" style={{ background: color }} />
                <span className={hasRh || !label.includes('building') ? '' : 'opacity-40'}>{label}</span>
              </span>
            ))}
          </div>
          <span className="font-mono text-[10px] text-on-primary-container opacity-50">
            kitco.com · {syncTime}
          </span>
        </div>

        {/* Partial-data notice — shown until Rh history covers the requested period */}
        {partial && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 text-[10px] text-on-primary-container">
            <span
              className="h-1 rounded-full bg-blue-400/60 shrink-0"
              style={{ width: `${coverage}%`, maxWidth: '80px', minWidth: '6px' }}
            />
            <span>
              Rh history building — {coverage}% of this period recorded.
              Chart fills in automatically every 30 min.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
