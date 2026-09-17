import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  BrainCircuit,
  Info,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction, Account } from '../types';
import { formatINR, formatDate, formatDateTime } from '../utils/format';
import { ExplainWhyModal } from '../components/ExplainWhyModal';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [anomalyOnly, setAnomalyOnly] = useState(false);

  // Add Transaction Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTxn, setNewTxn] = useState({
    account_id: '',
    amount: '',
    merchant: '',
    category: 'Auto',
    payment_method: 'UPI',
    description: '',
    type: 'EXPENSE',
  });
  const [aiPreview, setAiPreview] = useState<{
    category: string;
    confidence: number;
    reason: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Explain modal state
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [txns, accs] = await Promise.all([
        api.getTransactions({
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          type: typeFilter !== 'All' ? typeFilter : undefined,
          is_anomaly: anomalyOnly ? true : undefined,
          search: search || undefined,
          limit: 100,
        }),
        api.getAccounts(),
      ]);
      setTransactions(txns);
      setAccounts(accs);
      if (accs.length > 0 && !newTxn.account_id) {
        setNewTxn((prev) => ({ ...prev, account_id: accs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, typeFilter, anomalyOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Real-time AI categorization preview when typing merchant
  const handleMerchantChange = async (val: string) => {
    setNewTxn((prev) => ({ ...prev, merchant: val }));
    if (val.length >= 2) {
      try {
        const catRes = await api.categorizeMerchant(val, newTxn.description, Number(newTxn.amount) || 0);
        setAiPreview(catRes);
      } catch (e) {
        // silent fallback
      }
    } else {
      setAiPreview(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxn.account_id || !newTxn.amount || !newTxn.merchant) return;

    setSubmitting(true);
    try {
      await api.createTransaction({
        account_id: newTxn.account_id,
        amount: parseFloat(newTxn.amount),
        type: newTxn.type,
        category: newTxn.category === 'Auto' ? undefined : newTxn.category,
        merchant: newTxn.merchant,
        payment_method: newTxn.payment_method,
        description: newTxn.description,
      });
      setShowAddModal(false);
      setNewTxn({
        account_id: accounts[0]?.id || '',
        amount: '',
        merchant: '',
        category: 'Auto',
        payment_method: 'UPI',
        description: '',
        type: 'EXPENSE',
      });
      setAiPreview(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction? Account balance will be restored.')) {
      try {
        await api.deleteTransaction(id);
        loadData();
      } catch (err) {
        alert('Failed to delete transaction');
      }
    }
  };

  const categories = [
    'All',
    'Food',
    'Shopping',
    'Transport',
    'Bills',
    'Entertainment',
    'Healthcare',
    'Education',
    'Rent',
    'Salary',
    'Transfer',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-cyan-400" /> Transactions Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Search, filter, and inspect AI-categorized transactions with explainable anomaly flags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={api.getExportCSVUrl()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" /> Export CSV
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by merchant, keyword, or description (e.g. Swiggy, Uber, Rent)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </form>

          {/* Type Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Types</option>
              <option value="EXPENSE">Expenses</option>
              <option value="INCOME">Income</option>
              <option value="TRANSFER">Transfers</option>
            </select>

            {/* Anomaly Toggle */}
            <button
              onClick={() => setAnomalyOnly(!anomalyOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                anomalyOnly
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950'
                  : 'bg-slate-950 text-slate-400 border border-slate-700/80 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Anomalies Only
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Merchant &amp; Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">AI Verification</th>
                <th className="py-3.5 px-4 text-right">Amount (INR)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading transactions database...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Merchant & Anomaly Pill */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            txn.is_anomaly
                              ? 'bg-rose-500/15 text-rose-400'
                              : txn.type === 'INCOME'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {txn.type === 'INCOME' ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{txn.merchant}</span>
                            {txn.is_anomaly && (
                              <button
                                onClick={() =>
                                  setExplainModal({
                                    isOpen: true,
                                    title: `${txn.merchant} (${formatINR(txn.amount)})`,
                                    reason:
                                      txn.anomaly_reason ||
                                      'Amount is significantly higher than user baseline spending distribution.',
                                    riskLevel: 'HIGH',
                                    confidence: txn.ai_confidence,
                                    methodology: 'Isolation Forest + Statistical MAD',
                                  })
                                }
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                              >
                                ⚠ ANOMALY (Why?)
                              </button>
                            )}
                          </div>
                          {txn.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{txn.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {txn.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(txn.date)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <span className="font-mono text-[11px]">{txn.payment_method}</span>
                    </td>

                    {/* AI Confidence & Reason */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                          {(txn.ai_confidence * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() =>
                            setExplainModal({
                              isOpen: true,
                              title: `Categorization: ${txn.merchant} → ${txn.category}`,
                              reason:
                                txn.ai_categorization_reason ||
                                'Merchant name pattern matched known transaction signatures.',
                              confidence: txn.ai_confidence,
                              methodology: 'SmartBank NLP Rule-Based TF-IDF Hybrid Matcher',
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-cyan-300 underline"
                        >
                          Why?
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-mono text-sm font-bold ${
                          txn.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {txn.type === 'INCOME' ? '+' : '-'}
                        {formatINR(txn.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Record New Transaction</h3>
                  <p className="text-xs text-slate-400">Live AI auto-categorization and anomaly check</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              {/* Account Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Account</label>
                <select
                  value={newTxn.account_id}
                  onChange={(e) => setNewTxn({ ...newTxn, account_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({formatINR(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Merchant / Payee */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Merchant / Payee Name (e.g. Swiggy, Uber, Zepto)
                </label>
                <input
                  type="text"
                  required
                  value={newTxn.merchant}
                  onChange={(e) => handleMerchantChange(e.target.value)}
                  placeholder="e.g. Swiggy Delivery"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Real-time AI Categorization Preview */}
              {aiPreview && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5 animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">AI Suggested Category:</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-semibold">
                        {aiPreview.category}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {(aiPreview.confidence * 100).toFixed(0)}% Conf.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{aiPreview.reason}</p>
                  </div>
                </div>
              )}

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={newTxn.amount}
                    onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                    placeholder="450"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transaction Type</label>
                  <select
                    value={newTxn.type}
                    onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="EXPENSE">Expense (Debit)</option>
                    <option value="INCOME">Income (Credit)</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={newTxn.payment_method}
                  onChange={(e) => setNewTxn({ ...newTxn, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_TRANSFER">IMPS / NEFT / NetBanking</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newTxn.description}
                  onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
                  placeholder="Optional memo..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
