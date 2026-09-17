import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Building,
  DollarSign,
  X,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { Account, RecurringExpense } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    source_account_id: '',
    destination_account_id: '',
    destination_account_number: '',
    amount: '',
    description: 'Internal Account Transfer',
  });
  const [transferring, setTransferring] = useState(false);

  // Create Account Modal
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAcc, setNewAcc] = useState({
    account_name: '',
    account_type: 'SAVINGS',
    initial_balance: '',
  });
  const [creatingAcc, setCreatingAcc] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, recs] = await Promise.all([api.getAccounts(), api.getRecurring()]);
      setAccounts(accs);
      setRecurring(recs);
      if (accs.length >= 2) {
        setTransferData((prev) => ({
          ...prev,
          source_account_id: accs[0].id,
          destination_account_id: accs[1].id,
        }));
      }
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.source_account_id || !transferData.amount) return;

    setTransferring(true);
    try {
      await api.transferFunds({
        source_account_id: transferData.source_account_id,
        destination_account_id: transferData.destination_account_id || undefined,
        destination_account_number: transferData.destination_account_number || undefined,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
      });
      setShowTransferModal(false);
      setTransferData((prev) => ({ ...prev, amount: '' }));
      loadData();
      alert('Fund transfer completed successfully!');
    } catch (err: any) {
      alert(err.message || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.account_name) return;

    setCreatingAcc(true);
    try {
      await api.createAccount({
        account_name: newAcc.account_name,
        account_type: newAcc.account_type,
        initial_balance: parseFloat(newAcc.initial_balance) || 0,
      });
      setShowAccountModal(false);
      setNewAcc({ account_name: '', account_type: 'SAVINGS', initial_balance: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    } finally {
      setCreatingAcc(false);
    }
  };

  const handleToggleRecurring = async (id: string) => {
    try {
      await api.toggleRecurring(id);
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Top Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-extrabold text-2xl overflow-hidden shadow-lg shadow-cyan-500/20">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {user?.full_name || 'Alex Chen'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {user?.role || 'CUSTOMER'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'alex@smartbank.ai'}</p>
            <p className="text-xs text-slate-400">
              Monthly Inflow: <strong className="text-emerald-400 font-mono">{formatINR(user?.monthly_income || 45000)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer Funds
          </button>
          <button
            onClick={() => setShowAccountModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      </div>

      {/* Simulated Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Simulated Accounts Portfolio</h3>
            <p className="text-xs text-slate-400">Total Liquid Net Worth: {formatINR(totalBalance)}</p>
          </div>
          <span className="text-xs text-cyan-400 font-semibold">4 Simulated Accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-5 rounded-3xl bg-slate-900/80 border transition-all space-y-3 ${
                acc.is_primary ? 'border-cyan-500/40 shadow-lg shadow-cyan-950/20' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{acc.account_name}</span>
                {acc.is_primary && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    PRIMARY
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 font-mono block">{acc.account_number}</span>
                <span className="text-2xl font-extrabold text-white font-mono block">
                  {formatINR(acc.balance)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                <span>{acc.account_type}</span>
                <span className="text-emerald-400 font-semibold">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Recurring Subscriptions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Detected Recurring Subscriptions
            </h3>
            <p className="text-xs text-slate-400">
              Automatically recognized periodic charges with auto-debit alerts
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold font-mono">
            Total: {formatINR(recurring.reduce((s, r) => s + (r.is_active ? r.estimated_amount : 0), 0))}/mo
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          {recurring.map((rec) => (
            <div
              key={rec.id}
              className="py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">{rec.merchant}</span>
                  <span className="text-[11px] text-slate-400">
                    {rec.category} • Next due: {formatDate(rec.next_due_date)} • {rec.payment_method}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-white text-sm">
                  {formatINR(rec.estimated_amount)}/mo
                </span>
                <button
                  onClick={() => handleToggleRecurring(rec.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    rec.is_active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {rec.is_active ? 'Active' : 'Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fund Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-cyan-400" /> Transfer Funds
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source Account</label>
                <select
                  value={transferData.source_account_id}
                  onChange={(e) => setTransferData({ ...transferData, source_account_id: e.target.value })}
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
                <label className="block text-slate-300 font-semibold mb-1">Destination Account</label>
                <select
                  value={transferData.destination_account_id}
                  onChange={(e) => setTransferData({ ...transferData, destination_account_id: e.target.value })}
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
                <label className="block text-slate-300 font-semibold mb-1">Amount to Transfer (₹ INR)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transfer Memo</label>
                <input
                  type="text"
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25"
                >
                  {transferring ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Open Simulated Account</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Label</label>
                <input
                  type="text"
                  required
                  value={newAcc.account_name}
                  onChange={(e) => setNewAcc({ ...newAcc, account_name: e.target.value })}
                  placeholder="e.g. Travel Vault or Vacation Account"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Type</label>
                <select
                  value={newAcc.account_type}
                  onChange={(e) => setNewAcc({ ...newAcc, account_type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CHECKING">Checking Account</option>
                  <option value="EMERGENCY_FUND">Emergency Fund</option>
                  <option value="INVESTMENT">Investment Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Opening Deposit (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  value={newAcc.initial_balance}
                  onChange={(e) => setNewAcc({ ...newAcc, initial_balance: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAcc}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25"
                >
                  {creatingAcc ? 'Creating...' : 'Open Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
