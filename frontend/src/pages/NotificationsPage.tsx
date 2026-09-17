import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  PieChart,
  Target,
  Calendar,
  Check,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { formatDateTime } from '../utils/format';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ANOMALY_WARNING':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'BUDGET_ALERT':
        return <PieChart className="w-5 h-5 text-amber-400" />;
      case 'GOAL_PROGRESS':
        return <Target className="w-5 h-5 text-cyan-400" />;
      case 'RECURRING_DUE':
        return <Calendar className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (typeFilter === 'All') return true;
    return n.type === typeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-cyan-400" /> Notifications &amp; Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time proactive security notices, budget limits, and goal milestones.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Check className="w-4 h-4 text-cyan-400" /> Mark All as Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {['All', 'ANOMALY_WARNING', 'BUDGET_ALERT', 'GOAL_PROGRESS', 'SYSTEM_NOTICE'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              typeFilter === t
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
            No notifications matching the selected filter.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/95 border-slate-700/80 shadow-lg text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
