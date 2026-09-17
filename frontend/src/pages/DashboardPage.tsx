import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Receipt,
  BrainCircuit,
  Info,
  ChevronRight,
  Target,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary, AIInsight } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { ExplainWhyModal } from '../components/ExplainWhyModal';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Explainable AI modal state
  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    title: string;
    reason: string;
    confidence?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    methodology?: string;
  }>({
    isOpen: false,
    title: '',
    reason: '',
  });

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-80 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Could Not Load Dashboard</h3>
        <p className="text-xs text-slate-400 mb-4">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Financial Intelligence Overview
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time analytics, explainable anomaly detection, and predictive models.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/transactions"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Transaction
          </Link>
          <Link
            to="/assistant"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-400" /> Ask AI Co-Pilot
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Net Balance</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {formatINR(data.total_balance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.8%
            </span>{' '}
            from previous month
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Monthly Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
            {formatINR(data.monthly_income)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Payroll deposit on 1st of every month
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Monthly Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
            {formatINR(data.monthly_expenses)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            Savings Rate:{' '}
            <strong className="text-cyan-400 font-semibold">{data.savings_rate}%</strong>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 shadow-xl relative">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-cyan-300">Financial Health</span>
            <Link to="/insights" className="text-cyan-400 hover:text-cyan-300 text-xs">
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {data.health_score}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data.health_score >= 75 ? 'GOOD' : 'FAIR'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between">
            <span>5-Factor Index</span>
            <Link to="/insights" className="text-cyan-400 hover:underline text-[11px] font-semibold">
              View Breakdown →
            </Link>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar: Potential Anomaly Detected */}
      {data.active_anomalies_count > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-3">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Potential Unusual Activity Detected</h4>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                  High Priority Review
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ₹12,500 transaction at Titan Haute Horlogerie is significantly higher than your 90-day baseline range.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                setExplainModal({
                  isOpen: true,
                  title: 'Titan Haute Horlogerie (₹12,500)',
                  reason:
                    'Transaction amount of ₹12,500 is 4.2x higher than your 95th percentile historical shopping transactions (₹2,800). Z-Score is 3.84 standard deviations above user average.',
                  riskLevel: 'HIGH',
                  confidence: 0.96,
                  methodology: 'Ensemble Isolation Forest + Median Absolute Deviation (MAD)',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Why? (Explain)
            </button>
            <Link
              to="/transactions?is_anomaly=true"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-500/20"
            >
              Review Transaction
            </Link>
          </div>
        </div>
      )}

      {/* Main Charts Section: Cash Flow & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white font-display">Cash Flow Intelligence</h3>
              <p className="text-xs text-slate-400">Monthly Income vs Total Expenses vs Savings</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Expenses
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Net Savings
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.cash_flow_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
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
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
                <Area type="monotone" dataKey="savings" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Donut Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-display">Spending by Category</h3>
              <PieChartIcon className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.top_categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {data.top_categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown legend */}
            <div className="space-y-1.5 mt-2">
              {data.top_categories.slice(0, 4).map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {cat.category}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {formatINR(cat.amount)}{' '}
                    <span className="text-[10px] text-slate-400">({cat.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/forecast"
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
          >
            <span>View 30-Day Expense Forecast</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* AI Insights & Predictive Intelligence Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-display">
              AI Financial Intelligence &amp; Insights
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Explainable Predictions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.ai_insights.map((ins) => (
            <div
              key={ins.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {ins.insight_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Impact: {ins.impact_score}/10
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">{ins.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{ins.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() =>
                    setExplainModal({
                      isOpen: true,
                      title: ins.title,
                      reason: ins.explanation_why,
                      confidence: 0.94,
                      methodology: 'Historical Multi-Month Category Variance & Pattern NLP',
                    })
                  }
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Why? (Explain AI) <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {ins.action_suggested && (
                  <span className="text-[10px] text-slate-400 italic">Action recommended</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Budgets & Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Budgets Utilization */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Smart Budgets</h3>
              <p className="text-xs text-slate-400">Live month-to-date category caps</p>
            </div>
            <Link to="/budgets" className="text-xs text-cyan-400 font-semibold hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-4">
            {data.budget_utilization.map((b) => (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{b.category}</span>
                  <span className="text-slate-400 font-mono">
                    {formatINR(b.current_spent)} / {formatINR(b.monthly_limit)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.utilization_pct > 100
                        ? 'bg-rose-500'
                        : b.utilization_pct >= 90
                        ? 'bg-amber-400'
                        : b.utilization_pct >= 70
                        ? 'bg-yellow-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, b.utilization_pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={
                      b.status === 'Near Limit' || b.status === 'Exceeded'
                        ? 'text-rose-400 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {b.status}
                  </span>
                  <span className="text-slate-400">{b.utilization_pct}% used</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Live AI categorized payment records</p>
              </div>
              <Link to="/transactions" className="text-xs text-cyan-400 font-semibold hover:underline">
                View All ({data.recent_transactions.length})
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80 overflow-x-auto">
              {data.recent_transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        txn.is_anomaly
                          ? 'bg-rose-500/15 text-rose-400'
                          : txn.type === 'INCOME'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {txn.type === 'INCOME' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{txn.merchant}</span>
                        {txn.is_anomaly && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ANOMALY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{txn.category}</span>
                        <span>•</span>
                        <span>{formatDate(txn.date)}</span>
                        <span>•</span>
                        <span>{txn.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        txn.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {txn.type === 'INCOME' ? '+' : '-'}
                      {formatINR(txn.amount)}
                    </span>
                    <div className="text-[10px] text-cyan-400/80">
                      {(txn.ai_confidence * 100).toFixed(0)}% AI Conf.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by SmartBank Isolation Forest</span>
            <Link to="/transactions" className="text-cyan-400 font-semibold hover:underline">
              Search &amp; Filter All Transactions →
            </Link>
          </div>
        </div>
      </div>

      {/* Explainable AI Modal Drawer */}
      <ExplainWhyModal
        isOpen={explainModal.isOpen}
        onClose={() => setExplainModal({ ...explainModal, isOpen: false })}
        title={explainModal.title}
        reason={explainModal.reason}
        confidence={explainModal.confidence}
        riskLevel={explainModal.riskLevel}
        methodology={explainModal.methodology}
      />
    </div>
  );
};
