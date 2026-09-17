import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { formatINR, formatDate } from '../utils/format';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await api.getMonthlyReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Generating monthly financial report...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-cyan-400" /> Monthly Financial Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Exportable itemized statement with category variances and savings analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print / Save PDF
          </button>
          <a
            href={api.getExportCSVUrl()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Download CSV
          </a>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-800 print:border-gray-300 gap-4">
          <div>
            <div className="text-xl font-extrabold text-white print:text-black font-display">
              SMARTBANK AI FINANCIAL STATEMENT
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Billing Cycle: <strong className="text-cyan-400 print:text-black">{report?.month_year || 'Current Month'}</strong>
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-400 print:text-gray-600">
            <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            <p className="font-mono text-[11px]">Audit Hash: SB-{Date.now().toString(36).toUpperCase()}</p>
          </div>
        </div>

        {/* Financial Summary KPI Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
          <div>
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">Total Inflow</span>
            <span className="text-xl font-extrabold text-emerald-400 print:text-green-700 font-mono">
              {formatINR(report?.summary?.total_income)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">Total Outflow</span>
            <span className="text-xl font-extrabold text-rose-400 print:text-red-700 font-mono">
              {formatINR(report?.summary?.total_expenses)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">Net Savings</span>
            <span className="text-xl font-extrabold text-white print:text-black font-mono">
              {formatINR(report?.summary?.net_savings)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">Savings Rate</span>
            <span className="text-xl font-extrabold text-cyan-400 print:text-blue-700 font-mono">
              {report?.summary?.savings_rate}%
            </span>
          </div>
        </div>

        {/* Category Expense Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            Category Spending Distribution
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 text-[11px] uppercase">
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Amount (INR)</th>
                <th className="py-2 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {report?.category_breakdown?.map((c: any) => (
                <tr key={c.category}>
                  <td className="py-2 font-medium text-slate-200 print:text-black">{c.category}</td>
                  <td className="py-2 text-right font-mono font-semibold text-white print:text-black">
                    {formatINR(c.amount)}
                  </td>
                  <td className="py-2 text-right font-mono text-cyan-400 print:text-gray-800">
                    {c.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Budget Performance vs Actual */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            Budget Adherence Performance
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 text-[11px] uppercase">
                <th className="py-2">Budget Category</th>
                <th className="py-2 text-right">Monthly Limit</th>
                <th className="py-2 text-right">Actual Spent</th>
                <th className="py-2 text-right">Variance</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {report?.budget_performance?.map((b: any) => (
                <tr key={b.category}>
                  <td className="py-2 font-medium text-slate-200 print:text-black">{b.category}</td>
                  <td className="py-2 text-right font-mono">{formatINR(b.monthly_limit)}</td>
                  <td className="py-2 text-right font-mono font-semibold text-white print:text-black">
                    {formatINR(b.actual_spent)}
                  </td>
                  <td className="py-2 text-right font-mono text-cyan-400 print:text-black">
                    {formatINR(b.variance)}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'Within Budget'
                          ? 'bg-emerald-500/20 text-emerald-400 print:text-green-700'
                          : 'bg-rose-500/20 text-rose-400 print:text-red-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Memo */}
        <div className="pt-6 border-t border-slate-800 print:border-gray-300 text-center text-xs text-slate-400 print:text-gray-500">
          <p>This report is automatically synthesized from the SmartBank AI transactional database.</p>
          <p className="text-[10px] mt-1">SmartBank AI Prototype — Synthetic Demonstrations for FinTech Evaluation</p>
        </div>
      </div>
    </div>
  );
};
