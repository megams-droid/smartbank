import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { Budget } from '../types';
import { formatINR } from '../utils/format';

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    monthly_limit: '',
    alert_threshold: 90,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await api.getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.monthly_limit) return;

    setSubmitting(true);
    try {
      await api.createOrUpdateBudget({
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit),
        alert_threshold: Number(formData.alert_threshold) || 90,
      });
      setShowModal(false);
      setFormData({ category: 'Food', monthly_limit: '', alert_threshold: 90 });
      loadBudgets();
    } catch (err: any) {
      alert(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget limit?')) {
      try {
        await api.deleteBudget(id);
        loadBudgets();
      } catch {
        alert('Failed to delete budget');
      }
    }
  };

  const categories = [
    'Food',
    'Shopping',
    'Transport',
    'Bills',
    'Entertainment',
    'Healthcare',
    'Education',
    'Rent',
    'Travel',
    'Other',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <PieChart className="w-7 h-7 text-cyan-400" /> Smart Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set and track monthly category spending caps with automatic threshold warnings.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Create Budget Limit
        </button>
      </div>

      {/* Threshold Status Legend Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="text-slate-400 font-semibold">AI Threshold Categories:</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> 0–69%: Normal
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 70–89%: Watch
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 90–100%: Near Limit
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &gt;100%: Exceeded
          </span>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No budgets configured yet. Click "Create Budget Limit" to start tracking.
          </div>
        ) : (
          budgets.map((b) => {
            const isNearLimit = b.status === 'Near Limit' || b.status === 'Exceeded';
            return (
              <div
                key={b.id}
                className={`p-6 rounded-3xl bg-slate-900/80 border transition-all flex flex-col justify-between space-y-4 ${
                  b.status === 'Exceeded'
                    ? 'border-rose-500/50 shadow-lg shadow-rose-950/30'
                    : b.status === 'Near Limit'
                    ? 'border-amber-500/40'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white">{b.category}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'Exceeded'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : b.status === 'Near Limit'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : b.status === 'Watch'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Spent vs Limit Numbers */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-xs text-slate-400 block">Current Spent</span>
                      <span className="text-xl font-extrabold text-white font-mono">
                        {formatINR(b.current_spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Monthly Limit</span>
                      <span className="text-base font-semibold text-slate-300 font-mono">
                        {formatINR(b.monthly_limit)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.utilization_percentage > 100
                          ? 'bg-rose-500'
                          : b.utilization_percentage >= 90
                          ? 'bg-amber-400'
                          : b.utilization_percentage >= 70
                          ? 'bg-yellow-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, b.utilization_percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{b.utilization_percentage}% utilized</span>
                    <span>Remaining: {formatINR(Math.max(0, b.monthly_limit - b.current_spent))}</span>
                  </div>
                </div>

                {/* AI Insight Snippet */}
                {isNearLimit && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      AI Tip: You have utilized {b.utilization_percentage}% of your {b.category} budget. Consider capping optional spending for the rest of this cycle.
                    </span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setFormData({
                        category: b.category,
                        monthly_limit: String(b.monthly_limit),
                        alert_threshold: b.alert_threshold,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Edit Limit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Set Budget Limit</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Monthly Limit (₹ INR)</label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  required
                  value={formData.monthly_limit}
                  onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                  placeholder="e.g. 6000"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Alert Trigger Threshold (% of limit)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={formData.alert_threshold}
                  onChange={(e) => setFormData({ ...formData, alert_threshold: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25"
                >
                  {submitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
