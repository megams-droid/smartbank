import React from 'react';
import { X, Sparkles, BrainCircuit, ShieldAlert, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface ExplainWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  reason: string;
  confidence?: number;
  modelVersion?: string;
  factors?: Record<string, any>;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  methodology?: string;
}

export const ExplainWhyModal: React.FC<ExplainWhyModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  reason,
  confidence,
  modelVersion = 'v1.4.2-hybrid',
  factors,
  riskLevel,
  methodology,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden border rounded-2xl bg-slate-900 border-slate-700/80 shadow-2xl shadow-cyan-950/40">
        {/* Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Badge & Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Explainable AI Intelligence
            </span>
            {riskLevel && (
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  riskLevel === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : riskLevel === 'MEDIUM'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {riskLevel} Risk
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

          {/* Primary "Why?" Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">AI Reasoning ("Why?"):</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{reason}</p>
              </div>
            </div>
          </div>

          {/* Technical Metadata & Factors */}
          <div className="space-y-3 mb-6">
            {confidence !== undefined && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-xs text-slate-400">Model Confidence Score</span>
                <span className="text-xs font-semibold text-cyan-300">{(confidence * 100).toFixed(1)}% High Confidence</span>
              </div>
            )}

            {methodology && (
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Algorithmic Methodology:</span>
                <span className="text-xs text-slate-300">{methodology}</span>
              </div>
            )}

            {factors && Object.keys(factors).length > 0 && (
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-xs text-slate-400 block mb-2 font-medium">Evaluation Parameters:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(factors).map(([k, v]) => (
                    <div key={k} className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block capitalize">{k.replace(/_/g, ' ')}:</span>
                      <span className="text-slate-200 font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <span>Model: <span className="font-mono text-slate-300">{modelVersion}</span></span>
            <span>Ground Truth: User DB</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-600/20"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
