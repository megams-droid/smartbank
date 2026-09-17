import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Sparkles, ShieldAlert, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(role);
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-cyan-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-display">
              SMARTBANK <span className="text-cyan-400 text-sm">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-200">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to access your AI financial intelligence dashboard</p>
        </div>

        {/* 1-Click Demo Showcase Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 mb-6 shadow-xl text-left">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 1-Click Demo Evaluation
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase">No password required</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('CUSTOMER')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-left transition-all group"
            >
              <span className="text-xs font-bold text-cyan-300 block group-hover:text-cyan-200">Customer Demo</span>
              <span className="text-[10px] text-slate-400 block">Alex Chen (Customer)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('ADMIN')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-left transition-all group"
            >
              <span className="text-xs font-bold text-purple-300 block group-hover:text-purple-200">Admin Demo</span>
              <span className="text-[10px] text-slate-400 block">Chief Risk Officer</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@smartbank.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to SmartBank'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
