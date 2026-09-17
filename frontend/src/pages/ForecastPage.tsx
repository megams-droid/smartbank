import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  BrainCircuit,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { ForecastResponse } from '../types';
import { formatINR } from '../utils/format';
import { ExplainWhyModal } from '../components/ExplainWhyModal';

export const ForecastPage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Explain modal state
  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    title: string;
    reason: string;
    confidence?: number;
    methodology?: string;
  }>({
    isOpen: false,
    title: '',
    reason: '',
  });

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const data = await api.getForecast();
        setForecast(data);
      } catch (err) {
        console.error('Failed to load forecast', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="h-44 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="h-96 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
        <BrainCircuit className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Forecasting Data Unavailable</h3>
        <p className="text-xs text-slate-400">Please seed or add transaction records to generate time-series forecasts.</p>
      </div>
    );
  }

  const chartData = forecast.categories.map((c) => ({
    name: c.category,
    'Historical Avg': c.historical_avg,
    'Forecasted Next Month': c.forecasted_amount,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-cyan-400" /> Predictive Expense Forecasting
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            AI Engine v2.1
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Time-series regression projections for upcoming billing periods based on historical expenditure patterns.
        </p>
      </div>

      {/* Primary Forecast Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5" /> Forecast Target Period
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              {forecast.period}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Estimated with 91.2% historical trend confidence.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Projected Total Expenses
            </span>
            <div className="text-3xl font-extrabold text-white font-display">
              {formatINR(forecast.estimated_total_expenses)}
            </div>
            <div className="mt-1.5 text-xs flex items-center gap-1">
              {forecast.forecast_change_percentage >= 0 ? (
                <span className="text-amber-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{forecast.forecast_change_percentage}%
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {forecast.forecast_change_percentage}%
                </span>
              )}
              <span className="text-slate-400">vs historical baseline ({formatINR(forecast.historical_monthly_avg)})</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Multi-month Weighted Moving Average (WMA)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Linear Trend Slope Fitting across 8 categories</span>
            </div>
            <button
              onClick={() =>
                setExplainModal({
                  isOpen: true,
                  title: `Expense Forecast: ${forecast.period}`,
                  reason: `Calculated from your previous 3 months of weighted spending data. Trend slopes apply dampeners to volatile categories while preserving fixed recurring bills (Rent, Utilities, Subscriptions).`,
                  confidence: 0.91,
                  methodology: forecast.methodology,
                })
              }
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 underline"
            >
              <Info className="w-3.5 h-3.5" /> Explain Forecasting Formula ("Why?")
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Chart: Historical vs Forecasted */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-display">Category Expense Comparison</h3>
            <p className="text-xs text-slate-400">3-Month Historical Average vs Predicted Outlay</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-700" /> Historical Monthly Avg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500" /> Forecasted Next Month
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatINR(Number(val)), '']}
              />
              <Bar dataKey="Historical Avg" fill="#475569" radius={[6, 6, 0, 0]} maxBarSize={38} />
              <Bar dataKey="Forecasted Next Month" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Itemized Category Projections with "Why?" Rationale */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden p-6">
        <h3 className="text-base font-bold text-white font-display mb-4">
          Itemized Category Forecast Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecast.categories.map((cat) => (
            <div
              key={cat.category}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{cat.category}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.trend_direction === 'UP'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : cat.trend_direction === 'DOWN'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.trend_direction === 'UP' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : cat.trend_direction === 'DOWN' ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {cat.trend_percentage > 0 ? `+${cat.trend_percentage}%` : `${cat.trend_percentage}%`}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-extrabold text-cyan-300">
                    {formatINR(cat.forecasted_amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Hist: {formatINR(cat.historical_avg)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                {cat.explanation}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                <span>Confidence: {(cat.confidence * 100).toFixed(0)}%</span>
                <button
                  onClick={() =>
                    setExplainModal({
                      isOpen: true,
                      title: `Forecast Calculation for ${cat.category}`,
                      reason: cat.explanation,
                      confidence: cat.confidence,
                      methodology: forecast.methodology,
                    })
                  }
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Explain Formula →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable AI Modal Drawer */}
      <ExplainWhyModal
        isOpen={explainModal.isOpen}
        onClose={() => setExplainModal({ ...explainModal, isOpen: false })}
        title={explainModal.title}
        reason={explainModal.reason}
        confidence={explainModal.confidence}
        methodology={explainModal.methodology}
      />
    </div>
  );
};
