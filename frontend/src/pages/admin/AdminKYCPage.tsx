import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, Search, Filter, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/format';

export const AdminKYCPage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const loadKYC = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminKYC(statusFilter !== 'All' ? statusFilter : undefined);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load KYC queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKYC();
  }, [statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
          <UserCheck className="w-7 h-7 text-purple-400" /> KYC Compliance Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Review extracted OCR documents and perform compliance approvals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {['All', 'PENDING', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Records Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">User &amp; Email</th>
                <th className="py-3.5 px-4">Document Type</th>
                <th className="py-3.5 px-4">Document Number</th>
                <th className="py-3.5 px-4">Extracted Name</th>
                <th className="py-3.5 px-4">OCR Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading KYC records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No KYC submissions found in this queue.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{r.user_name}</span>
                      <span className="text-[11px] text-slate-400">{r.user_email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold text-[11px]">
                        {r.document_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-300">{r.document_number}</td>
                    <td className="py-3.5 px-4 text-slate-200">{r.extracted_name}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      {(r.ocr_confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'NEEDS_REVIEW'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">{formatDate(r.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
