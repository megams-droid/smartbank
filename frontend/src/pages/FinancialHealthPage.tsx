import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Info,
  TrendingUp,
  PieChart,
  Target,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { FinancialHealthResponse } from '../types';
import { ExplainWhyModal } from '../components/ExplainWhyModal';

export const FinancialHealthPage: React.FC = () => {
  const [health, setHealth] = useState<FinancialHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Explain modal state
  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    title: string;
    reason: string;
    methodology?: string;
  }>({
    isOpen: false,
    title: '',
    reason: '',
  });

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        const data = await api.getFinancialHealth();
        setHealth(data);
      } catch (err) {
        console.error('Failed to load financial health', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="h-44 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
        <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Financial Health Unavailable</h3>
        <p className="text-xs text-slate-400">Please seed or add transaction data to compute your score.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-cyan-400" /> Financial Health Analysis
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Multi-Factor Index
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent 0–100 personal financial wellness score based on savings, budget discipline, and safety reserves.
        </p>
      </div>

      {/* Primary Gauge Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Score Number Display */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950 shadow-inner">
              <div
                className="absolute inset-0 rounded-full border-4 border-cyan-400"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${health.overall_score}%, 0 ${health.overall_score}%)`,
                }}
              />
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
                  {health.overall_score}
                </span>
                <span className="block text-[11px] text-slate-400 font-bold uppercase mt-0.5">/ 100</span>
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {health.rating} RATING
              </span>
              <h3 className="text-xl font-bold text-white mt-2 font-display">Personal Wellness Index</h3>
              <p className="text-xs text-slate-400 mt-1">Calculated across 5 quantitative cash flow pillars.</p>
            </div>
          </div>

          {/* Summary Insight */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> AI Diagnostic Summary
              </span>
              <button
                onClick={() =>
                  setExplainModal({
                    isOpen: true,
                    title: 'How is Financial Health Calculated?',
                    reason: health.calculation_details,
                    methodology:
                      'Weighted composite index of Savings Rate (25%), Budget Adherence (25%), Spending Consistency (20%), Emergency Reserve (15%), and Goal Milestones (15%).',
                  })
                }
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                How is this calculated?
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {health.summary_insight}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Factor Score Breakdown Cards */}
      <div>
        <h3 className="text-base font-bold text-white font-display mb-4">
          5-Factor Diagnostic Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health.factors.map((fac, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{fac.name}</h4>
                  <span className="text-[11px] text-slate-400">Weight: {(fac.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-cyan-400 font-display">
                    {fac.score}
                  </span>
                  <span className="text-[10px] text-slate-400">/100</span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    fac.score >= 80
                      ? 'bg-emerald-400'
                      : fac.score >= 60
                      ? 'bg-cyan-500'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${fac.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">{fac.description}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                  {fac.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" /> Actionable Recommendations to Boost Score
        </h3>

        <div className="space-y-2.5">
          {health.improvement_tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prominent Educational Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs text-center space-y-1">
        <p>
          <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
          <strong>Transparent Educational Metric:</strong> This score is designed exclusively for personal budgeting and financial wellness.
        </p>
        <p className="text-[11px]">
          It is NOT an official bank credit score, CIBIL/Experian report, or formal creditworthiness appraisal.
        </p>
      </div>

      {/* Explainable AI Modal Drawer */}
      <ExplainWhyModal
        isOpen={explainModal.isOpen}
        onClose={() => setExplainModal({ ...explainModal, isOpen: false })}
        title={explainModal.title}
        reason={explainModal.reason}
        methodology={explainModal.methodology}
      />
    </div>
  );
};
