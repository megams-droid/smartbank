import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Cpu,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Sparkles,
  Activity,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminStatsResponse } from '../../types';
import { formatINR, formatDate } from '../../utils/format';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [fraudItems, setFraudItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [sData, fData] = await Promise.all([api.getAdminStats(), api.getFraudQueue()]);
        setStats(sData);
        setFraudItems(fData);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
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
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-purple-400" /> Admin Risk &amp; Security Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Role: Chief Risk Officer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time fraud review queues, compliance KYC audits, and AI model health monitoring.
          </p>
        </div>

        <Link
          to="/admin/fraud"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <ShieldAlert className="w-4 h-4" /> Open Fraud Queue
        </Link>
      </div>

      {/* Admin KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Anomalies */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Potential Anomalies</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-display">
            {stats?.open_anomalies_count || '02'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Requires manual security review</div>
        </div>

        {/* Pending KYC */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending KYC Review</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-display">
            {stats?.pending_kyc_count || '01'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Document verifications queued</div>
        </div>

        {/* Total Platform Volume */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Processed Volume</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-display">
            {formatINR(stats?.total_volume || 450000)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {stats?.total_transactions || 120} total transactions
          </div>
        </div>

        {/* Model Accuracy */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/30 border border-purple-500/30 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-purple-300">Model Accuracy</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-display">
            {stats?.model_accuracy_estimate || 96.4}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Anomaly rate: {stats?.anomaly_detection_rate || 2.5}%</div>
        </div>
      </div>

      {/* Fraud Review Queue Snippet */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Active Fraud &amp; Anomaly Queue
            </h3>
            <p className="text-xs text-slate-400">Transactions flagged by Isolation Forest &amp; MAD algorithms</p>
          </div>
          <Link to="/admin/fraud" className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1">
            View All in Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          {fraudItems.slice(0, 3).map((item) => (
            <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{item.merchant}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Risk Score: {item.anomaly_score}/100
                  </span>
                  <span className="text-slate-400 text-[11px]">User: {item.user_name}</span>
                </div>
                <p className="text-slate-300 text-xs">{item.reason}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-base font-bold text-white">
                  {formatINR(item.amount)}
                </span>
                <Link
                  to="/admin/fraud"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards to Admin Portals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/fraud"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white group-hover:text-purple-300">Fraud Queue</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-xs text-slate-400">Review suspicious transaction outliers and mark resolution status.</p>
        </Link>

        <Link
          to="/admin/kyc"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white group-hover:text-purple-300">KYC Verification</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Audit extracted OCR records and approve/reject simulated identity files.</p>
        </Link>

        <Link
          to="/admin/system"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white group-hover:text-purple-300">AI Model Health</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">Monitor inference latency, categorizer accuracy, and ML retraining logs.</p>
        </Link>
      </div>
    </div>
  );
};
