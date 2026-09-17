import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  PieChart,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  Receipt,
  Target,
  ArrowUpRight,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async (role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    await demoLogin(role);
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white font-display">
            SMARTBANK <span className="text-cyan-400 font-medium text-sm">AI</span>
          </span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDemoClick('CUSTOMER')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-700/60 hover:bg-cyan-900/60 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo (Customer)
          </button>
          <button
            onClick={() => handleDemoClick('ADMIN')}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-700/60 hover:bg-purple-900/60 transition-all hover:scale-105"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> 1-Click Demo (Admin)
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-purple-600/20 blur-[130px] -z-10 rounded-full pointer-events-none" />

        {/* Hero Top Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-medium text-cyan-300 mb-8 shadow-inner shadow-cyan-950">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Next-Generation FinTech Intelligence Engine</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-[10px] font-bold border border-cyan-800">INR ₹</span>
        </div>

        {/* Main Hero Headings */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          SMARTER MONEY.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            BETTER DECISIONS.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Turn everyday banking data into intelligent financial decisions. Explainable AI anomaly detection, predictive expense forecasting, smart budgeting, and grounded conversational co-pilots.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleDemoClick('CUSTOMER')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-2 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            Explore Live Customer Demo
          </button>
          <button
            onClick={() => handleDemoClick('ADMIN')}
            className="px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm sm:text-base transition-all flex items-center gap-2 hover:border-slate-500"
          >
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            Admin Risk Center
          </button>
        </div>

        {/* Visual Pipeline Showcase */}
        <div className="mt-20 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-6 flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" /> Core Financial Intelligence Pipeline
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {[
              { step: '01', title: 'Your Transactions', desc: 'Raw UPI, Cards & Bank debits', icon: Receipt },
              { step: '02', title: 'AI Analysis', desc: 'NLP Categorizer & Isolation Forest', icon: BrainCircuit },
              { step: '03', title: 'Smart Insights', desc: 'Explainable "Why?" reasoning', icon: Sparkles },
              { step: '04', title: 'Predictions & Alerts', desc: '30-day forecast & anomaly risk', icon: TrendingUp },
              { step: '05', title: 'Better Decisions', desc: 'Automated goal funding & savings', icon: Target },
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left relative group hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">{node.step}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{node.title}</h4>
                  <p className="text-xs text-slate-400 leading-snug">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation & Key Features Grid */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">FINTECH REINVENTED</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Not just a banking dashboard. <br />
            An AI Financial Co-pilot.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Explainable Anomaly & Fraud Risk',
              desc: 'Ensemble Isolation Forest and statistical MAD algorithms flag unusual spending with transparent "Why?" explanations.',
              icon: ShieldAlert,
              badge: 'Isolation Forest + MAD',
            },
            {
              title: 'Predictive 30-Day Expense Forecast',
              desc: 'Weighted moving average and category trend slopes forecast upcoming monthly outlays with confidence intervals.',
              icon: TrendingUp,
              badge: 'Time-Series WMA',
            },
            {
              title: 'Instant NLP Auto-Categorization',
              desc: 'Classifies merchant text into Food, Shopping, Transport, Bills, Rent, etc., with high confidence scoring.',
              icon: Receipt,
              badge: 'Pattern NLP Engine',
            },
            {
              title: 'Grounded Financial Assistant',
              desc: 'Ask questions in plain English ("What is my biggest expense?", "Can I afford ₹15k?") and get database-verified facts.',
              icon: BrainCircuit,
              badge: 'Database Grounded',
            },
            {
              title: '0–100 Financial Health Scoring',
              desc: 'Transparent multi-factor index combining savings rates, budget limits, volatility, and safety fund resilience.',
              icon: Sparkles,
              badge: 'Transparent Formula',
            },
            {
              title: 'Admin Risk & Compliance Center',
              desc: 'Comprehensive back-office suite with fraud review queues, KYC verification audits, and model health monitoring.',
              icon: ShieldCheck,
              badge: 'Admin Center',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all hover:translate-y-[-2px] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                      {feat.badge}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-cyan-400 font-semibold group-hover:text-cyan-300">
                  Explore Feature <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Synthetic Data Architecture */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-4 border border-cyan-500/20">
              <Lock className="w-3.5 h-3.5" /> Security & Privacy by Design
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-4">
              Synthetic-Data First, Privacy-Preserving Architecture.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              SmartBank AI is engineered with zero exposure to real banking credentials. All demo evaluations utilize synthetic account structures, simulated KYC document pipelines, and deterministic math guarantees.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bcrypt password hashing + JWT token session architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-based access control (RBAC) protecting Admin Risk Center</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full audit logging and explainable algorithmic boundaries</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span>Security Pipeline</span>
              <span className="text-emerald-400">STATUS: PASS</span>
            </div>
            <p className="text-cyan-400">✓ Database: SQLite / PostgreSQL ORM</p>
            <p className="text-slate-300">✓ Anomaly Trigger: Z-Score &gt; 3.0 &amp; MAD Spikes</p>
            <p className="text-slate-300">✓ Real Banking Passwords: ZERO (100% Simulated)</p>
            <p className="text-slate-300">✓ Currency Standard: Indian Rupee (₹)</p>
            <p className="text-purple-400">✓ ML Models: Scikit-learn + Explainable Rules</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">FAQ</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Common Questions</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does SmartBank AI detect transaction anomalies?',
              a: 'SmartBank AI uses an ensemble of Isolation Forest and statistical Z-Score / Median Absolute Deviation (MAD) over your personal transaction history. When a transaction like a ₹12,500 jewelry purchase deviates 4.2x from historical baselines, it triggers an instant risk indicator and provides a clear "Why?" explanation.',
            },
            {
              q: 'Is this real banking or a simulation?',
              a: 'SmartBank AI is a FinTech prototype developed for hackathon evaluation using synthetic demo data. It does not connect to actual bank accounts, process legal payments, or provide formal lending advice.',
            },
            {
              q: 'How does the AI Assistant know my exact balances?',
              a: 'The SmartBank Assistant queries the live database for transactions, accounts, and budgets in real-time. It separates hard database facts from predictive forecasts and will never hallucinate imaginary financial records.',
            },
            {
              q: 'How do I test the Admin Risk Center?',
              a: 'You can use the 1-Click Demo Login button in the top bar to instantly sign in as the Chief Risk Officer (Admin), where you can review fraud queues, approve KYC verifications, and monitor AI model health.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                {item.q}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Final CTA */}
      <section className="py-20 px-4 sm:px-8 text-center max-w-5xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-purple-900/40 border border-cyan-500/30 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-4">
            Ready to experience SmartBank AI?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8">
            Launch the 3-minute hackathon demo now to explore explainable AI, proactive expense forecasts, and the Admin Risk Center.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleDemoClick('CUSTOMER')}
              className="px-8 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all"
            >
              Launch Customer Demo (Alex Chen)
            </button>
            <button
              onClick={() => handleDemoClick('ADMIN')}
              className="px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              Launch Admin Demo (CRO)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
