import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  FileText,
  Bell,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Sliders,
  Users,
  Cpu,
  ArrowLeftRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const DashboardLayout: React.FC = () => {
  const { user, isAdmin, logout, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    };
    fetchNotifications();
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleRoleSwitch = async () => {
    setSwitchingRole(true);
    try {
      if (isAdmin) {
        await demoLogin('CUSTOMER');
        navigate('/dashboard');
      } else {
        await demoLogin('ADMIN');
        navigate('/admin');
      }
    } finally {
      setSwitchingRole(false);
    }
  };

  interface NavLinkItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    count?: number;
  }

  interface NavSection {
    title: string;
    links: NavLinkItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'Banking Core',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', path: '/transactions', icon: Receipt },
        { name: 'Accounts & Transfers', path: '/profile', icon: CreditCard },
      ],
    },
    {
      title: 'AI Intelligence',
      links: [
        { name: 'AI Financial Assistant', path: '/assistant', icon: BrainCircuit, badge: 'Live AI' },
        { name: 'Expense Forecasting', path: '/forecast', icon: TrendingUp },
        { name: 'Financial Health', path: '/insights', icon: Sparkles },
        { name: 'Smart Budgets', path: '/budgets', icon: PieChart },
        { name: 'Savings Goals', path: '/goals', icon: Target },
        { name: 'Monthly Reports', path: '/reports', icon: FileText },
      ],
    },
    {
      title: 'FinTech Demos',
      links: [
        { name: 'KYC Verification', path: '/kyc', icon: UserCheck, badge: 'Demo' },
        { name: 'Credit Risk Analysis', path: '/credit-risk', icon: ShieldAlert, badge: 'Sim' },
        { name: 'Notification Center', path: '/notifications', icon: Bell, count: unreadCount },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'Admin Risk Center',
            links: [
              { name: 'Risk Center Overview', path: '/admin', icon: ShieldCheck },
              { name: 'Fraud Review Queue', path: '/admin/fraud', icon: ShieldAlert, badge: 'Critical' },
              { name: 'KYC Review Queue', path: '/admin/kyc', icon: UserCheck },
              { name: 'User Monitoring', path: '/admin/users', icon: Users },
              { name: 'AI Model Health', path: '/admin/system', icon: Cpu },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight font-display text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                SMARTBANK <span className="text-cyan-400 font-normal text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">AI</span>
              </span>
            </div>
          </Link>

          {/* AI Engine Status indicator */}
          <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Models Online: <strong className="text-cyan-400">v2.1 Hybrid</strong></span>
          </div>
        </div>

        {/* Right: Role Switcher, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <button
            onClick={handleRoleSwitch}
            disabled={switchingRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-200 transition-all hover:border-cyan-500/40"
            title="Toggle between Demo Customer and Admin Risk Center"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${switchingRole ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              Role: <strong className={isAdmin ? 'text-purple-400' : 'text-cyan-400'}>{isAdmin ? 'Admin' : 'Customer'}</strong>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">Switch</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/60 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-cyan-400" /> Notifications
                  </h4>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto custom-scrollbar my-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded-lg transition-colors">
                        <p className="text-xs font-medium text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold text-xs overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  {user?.full_name || 'Demo User'}
                </span>
                <span className="text-[10px] text-slate-400">{user?.role || 'CUSTOMER'}</span>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-800/80 bg-slate-950/95 lg:bg-slate-950/60 backdrop-blur-md flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="overflow-y-auto custom-scrollbar p-4 space-y-6">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h5 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {sec.title}
                </h5>
                <div className="space-y-1">
                  {sec.links.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span>{link.name}</span>
                        </div>
                        {link.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {link.badge}
                          </span>
                        )}
                        {link.count !== undefined && link.count > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {link.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick AI Assistant Card in sidebar */}
          <div className="p-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/20 text-left">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> SmartBank Assistant
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
                Ask about spending, food bills, or calculate savings instantly.
              </p>
              <Link
                to="/assistant"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Open Assistant <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          />
        )}

        {/* Main Workspace Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <Outlet />

          {/* Compliance Disclaimer Banner */}
          <footer className="mt-12 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-1">
            <p>
              <Lock className="w-3 h-3 inline mr-1 text-slate-400" />
              <strong>SmartBank AI Demonstration Prototype:</strong> Uses synthetic demo datasets for hackathon evaluation.
            </p>
            <p className="text-[11px]">
              Does not connect to real bank accounts, process legal payments, or provide formal lending/credit advice. Currency formatted in INR (₹).
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
