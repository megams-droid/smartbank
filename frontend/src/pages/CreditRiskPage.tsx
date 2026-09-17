import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { CreditRiskResponse } from '../types';
import { formatINR } from '../utils/format';

export const CreditRiskPage: React.FC = () => {
  const [income, setIncome] = useState(45000);
  const [loanAmount, setLoanAmount] = useState(100000);
  const [tenure, setTenure] = useState(12);
  const [assessment, setAssessment] = useState<CreditRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const data = await api.analyzeCreditRisk({
        monthly_income: income,
        requested_loan_amount: loanAmount,
        loan_tenure_months: tenure,
      });
      setAssessment(data);
    } catch (err) {
      console.error('Failed to run credit risk analysis', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [income, loanAmount, tenure]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cyan-400" /> Credit Risk Simulation Demo
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Educational Model
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent educational cash-flow risk underwriting simulator with multi-factor risk band assessment.
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Educational Disclaimer:</strong> This module is a synthetic simulation demonstrating how cash-flow underwriting works. It does NOT pull real credit bureau records (CIBIL/Experian) and does NOT issue real loans.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Parameter Sliders */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> Underwriting Parameters
          </h3>

          {/* Monthly Income Slider */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Monthly Income</label>
              <span className="font-mono font-bold text-cyan-400">{formatINR(income)}/mo</span>
            </div>
            <input
              type="range"
              min="20000"
              max="150000"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Requested Loan Amount Slider */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Simulated Credit Request</label>
              <span className="font-mono font-bold text-white">{formatINR(loanAmount)}</span>
            </div>
            <input
              type="range"
              min="25000"
              max="500000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Loan Tenure Slider */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Loan Tenure</label>
              <span className="font-mono font-bold text-white">{tenure} Months</span>
            </div>
            <input
              type="range"
              min="6"
              max="36"
              step="6"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <span className="text-slate-400 font-semibold block mb-1">Estimated EMI (Monthly):</span>
            <span className="text-lg font-bold font-mono text-cyan-300">
              {formatINR(Math.round((loanAmount * 1.12) / tenure))}/month
            </span>
            <span className="text-[10px] text-slate-400 block">Calculated at 12% simulated annual interest</span>
          </div>
        </div>

        {/* Assessment Output Results */}
        {assessment && (
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            {/* Top Risk Band & Score */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Simulated Credit Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white font-display">
                    {assessment.estimated_score}
                  </span>
                  <span className="text-xs text-slate-400">/ 850 Max</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    assessment.risk_band === 'LOW'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : assessment.risk_band === 'MODERATE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {assessment.risk_band} RISK TIER
                </span>
                <p className="text-xs text-slate-400 mt-1.5">
                  Max Safe Limit: <strong className="text-white">{formatINR(assessment.max_recommended_credit)}</strong>
                </p>
              </div>
            </div>

            {/* Explainable Factor Breakdown */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Underwriting Factor Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assessment.key_factors.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{f.factor}</span>
                      <span className="font-mono text-cyan-400 font-bold">{f.score}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Rating: {f.rating}</span>
                      <span className="text-emerald-400">{f.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transparent Explanation Text */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs font-semibold text-cyan-400 block mb-1">
                AI Underwriting Rationale:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{assessment.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
