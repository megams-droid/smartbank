import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  X,
  Sparkles,
  Info,
  AlertOctagon,
} from 'lucide-react';
import { api } from '../../services/api';
import { formatINR, formatDate, formatDateTime } from '../../utils/format';
import { ExplainWhyModal } from '../../components/ExplainWhyModal';

export const FraudQueuePage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Review action modal state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState('RESOLVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Explain modal state
  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    title: string;
    reason: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  }>({
    isOpen: false,
    title: '',
    reason: '',
  });

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getFraudQueue(statusFilter !== 'All' ? statusFilter : undefined);
      setItems(data);
    } catch (err) {
      console.error('Failed to load fraud queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [statusFilter]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    try {
      await api.reviewAnomaly(selectedItem.id, {
        status: reviewStatus,
        review_notes: reviewNotes || 'Verified by Chief Risk Officer.',
      });
      setSelectedItem(null);
      setReviewNotes('');
      loadQueue();
    } catch (err) {
      alert('Failed to update fraud review status');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item.merchant?.toLowerCase().includes(s) ||
      item.user_name?.toLowerCase().includes(s) ||
      item.reason?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-400" /> Fraud Review Queue
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            SecOps Review Queue
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Inspect and triage transactions flagged by the Isolation Forest &amp; MAD anomaly detection engine.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant, user, or reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {['All', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Transaction &amp; User</th>
                <th className="py-3.5 px-4">Risk Level &amp; Score</th>
                <th className="py-3.5 px-4">Algorithmic Reason</th>
                <th className="py-3.5 px-4 text-right">Amount (INR)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading fraud review queue...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions currently matching the selected queue filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User & Merchant */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-white text-sm block">{item.merchant}</span>
                        <span className="text-[11px] text-slate-400">
                          {item.user_name} ({item.user_email})
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatDateTime(item.transaction_date)}
                        </span>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.risk_level === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          }`}
                        >
                          {item.risk_level} RISK
                        </span>
                        <div className="text-[11px] font-mono text-slate-300">
                          Score: <strong>{item.anomaly_score}/100</strong>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-300 line-clamp-2">{item.reason}</p>
                      <button
                        onClick={() =>
                          setExplainModal({
                            isOpen: true,
                            title: `Anomaly Analysis: ${item.merchant}`,
                            reason: item.reason,
                            riskLevel: item.risk_level,
                          })
                        }
                        className="text-[10px] text-purple-400 hover:underline mt-1 block"
                      >
                        View Full "Why?" Rationale →
                      </button>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-sm font-bold text-white">
                        {formatINR(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{item.payment_method}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'OPEN'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : item.status === 'UNDER_REVIEW'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setReviewStatus(item.status === 'OPEN' ? 'RESOLVED' : item.status);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg border rounded-3xl bg-slate-900 border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Review Flagged Transaction</h3>
                <p className="text-xs text-purple-400">
                  {selectedItem.merchant} ({formatINR(selectedItem.amount)})
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold block">Flag Reason:</span>
                <p className="text-slate-300">{selectedItem.reason}</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Set Resolution Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="RESOLVED">RESOLVED (Legitimate Verified Transaction)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Escalated to User Step-up Auth)</option>
                  <option value="FALSE_POSITIVE">FALSE_POSITIVE (Adjust Statistical Threshold)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">SecOps Review Notes</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter audit resolution comments..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/25"
                >
                  {saving ? 'Saving...' : 'Confirm Resolution'}
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
        riskLevel={explainModal.riskLevel}
        methodology="Ensemble Isolation Forest + Median Absolute Deviation (MAD)"
      />
    </div>
  );
};
