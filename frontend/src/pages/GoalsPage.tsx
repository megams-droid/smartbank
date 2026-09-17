import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  X,
  Laptop,
  Shield,
  Plane,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { FinancialGoal, Account } from '../types';
import { formatINR, formatDate } from '../utils/format';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Contribute Modal
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [contributing, setContributing] = useState(false);

  // Create Goal Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    initial_amount: '',
    target_date: '',
    category: 'Electronics',
    icon: 'Laptop',
  });
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gData, aData] = await Promise.all([api.getGoals(), api.getAccounts()]);
      setGoals(gData);
      setAccounts(aData);
      if (aData.length > 0) {
        setSelectedAccountId(aData[0].id);
      }
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount || !selectedAccountId) return;

    setContributing(true);
    try {
      await api.contributeGoal(selectedGoal.id, {
        amount: parseFloat(depositAmount),
        account_id: selectedAccountId,
      });
      setSelectedGoal(null);
      setDepositAmount('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to deposit to goal');
    } finally {
      setContributing(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount || !newGoal.target_date) return;

    setCreating(true);
    try {
      await api.createGoal({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        initial_amount: newGoal.initial_amount ? parseFloat(newGoal.initial_amount) : 0,
        target_date: new Date(newGoal.target_date).toISOString(),
        category: newGoal.category,
        icon: newGoal.icon,
      });
      setShowCreateModal(false);
      setNewGoal({
        name: '',
        target_amount: '',
        initial_amount: '',
        target_date: '',
        category: 'Electronics',
        icon: 'Laptop',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-purple-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      default:
        return <Target className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Target className="w-7 h-7 text-cyan-400" /> Savings Goals &amp; Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set dedicated target funds, track automated contributions, and calculate required monthly savings.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Create Target Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading savings goals...</div>
        ) : goals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No goals found. Click "Create Target Goal" to get started.
          </div>
        ) : (
          goals.map((g) => (
            <div
              key={g.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                      {renderIcon(g.icon)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{g.name}</h3>
                      <span className="text-xs text-slate-400">{g.category}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      g.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {g.status === 'COMPLETED' ? 'COMPLETED 🎉' : `${g.progress_percentage}% FUNDED`}
                  </span>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xs text-slate-400 block">Accumulated</span>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {formatINR(g.current_amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Target Goal</span>
                    <span className="text-lg font-semibold text-slate-300 font-mono">
                      {formatINR(g.target_amount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, g.progress_percentage)}%` }}
                  />
                </div>

                {/* Target Date & Suggested Monthly Saving */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-400" /> Target Date:
                    </span>
                    <span className="font-semibold text-slate-200">{formatDate(g.target_date)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Suggested Monthly:</span>
                    <span className="font-semibold text-cyan-300 font-mono">
                      {formatINR(g.suggested_monthly_saving)}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Remaining: <strong>{formatINR(g.remaining_amount)}</strong>
                </span>

                <button
                  onClick={() => setSelectedGoal(g)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Deposit Funds
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Deposit Contribution Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Deposit to Goal</h3>
                <p className="text-xs text-cyan-400">{selectedGoal.name}</p>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({formatINR(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit Amount (₹ INR)</label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contributing}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25"
                >
                  {contributing ? 'Transferring...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create Target Goal</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g. MacBook Pro M-Series"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    placeholder="80000"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newGoal.initial_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, initial_amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Emergency">Emergency Fund</option>
                    <option value="Travel">Travel &amp; Vacation</option>
                    <option value="Education">Education</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Icon Style</label>
                  <select
                    value={newGoal.icon}
                    onChange={(e) => setNewGoal({ ...newGoal, icon: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Laptop">Laptop / Tech</option>
                    <option value="Shield">Shield / Safety</option>
                    <option value="Plane">Plane / Travel</option>
                    <option value="GraduationCap">Academic / Degree</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25"
                >
                  {creating ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
