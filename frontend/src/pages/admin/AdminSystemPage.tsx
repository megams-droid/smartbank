import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Activity, Zap, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSystemPage: React.FC = () => {
  const [modelData, setModelData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const data = await api.getModelMonitoring();
        setModelData(data);
      } catch (err) {
        console.error('Failed to load model monitoring', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading AI model metrics...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Cpu className="w-7 h-7 text-cyan-400" /> AI Model Health &amp; Inferences
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Nominal
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Telemetry, inference latency, accuracy diagnostics, and algorithmic architecture status.
        </p>
      </div>

      {/* System Health Top Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">API Uptime</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-display">
            {modelData?.system_health?.api_uptime || '99.98%'}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">DB Latency</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-display">
            {modelData?.system_health?.database_latency_ms || '0.9'} ms
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Active Workers</span>
          <span className="text-2xl font-extrabold text-purple-400 font-display">
            {modelData?.system_health?.active_workers || '4'}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Environment</span>
          <span className="text-lg font-bold text-white font-mono mt-1 block">
            {modelData?.system_health?.environment || 'Production'}
          </span>
        </div>
      </div>

      {/* AI Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modelData?.models?.map((m: any, i: number) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{m.name}</h3>
                <span className="font-mono text-xs text-cyan-400">{m.version}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {m.status}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 font-semibold block mb-0.5">Architecture:</span>
              <span>{m.architecture}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Accuracy</span>
                <span className="font-bold text-white text-sm font-mono">{m.accuracy}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Avg Latency</span>
                <span className="font-bold text-cyan-400 text-sm font-mono">{m.avg_latency_ms} ms</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Inferences 24h</span>
                <span className="font-bold text-purple-300 text-sm font-mono">{m.inferences_24h}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
              <span>Last Retrained: {m.last_retrained}</span>
              <span className="text-emerald-400 font-semibold">Continuous Validated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
