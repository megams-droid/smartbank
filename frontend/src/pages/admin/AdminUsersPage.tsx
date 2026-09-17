import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, CreditCard, Receipt, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { formatINR, formatDate } from '../../utils/format';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers(search || undefined);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load admin users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-400" /> User Monitoring &amp; Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Supervise customer portfolios, active balances, transaction counts, and KYC statuses.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Accounts</th>
                <th className="py-3.5 px-4">Total Balance</th>
                <th className="py-3.5 px-4">Transactions</th>
                <th className="py-3.5 px-4">KYC State</th>
                <th className="py-3.5 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading users list...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block text-sm">{u.full_name}</span>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-mono">{u.account_count} active</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {formatINR(u.total_balance)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{u.transaction_count} txns</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.kyc_status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}
                      >
                        {u.kyc_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">{formatDate(u.created_at)}</td>
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
