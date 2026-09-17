import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { KYCRecord } from '../types';
import { formatDate } from '../utils/format';

export const KYCPage: React.FC = () => {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [docType, setDocType] = useState('AADHAAR');
  const [docNumber, setDocNumber] = useState('XXXX-XXXX-8921');
  const [extractedName, setExtractedName] = useState('Alex Chen');
  const [extractedDob, setExtractedDob] = useState('1996-08-14');
  const [extractedAddress, setExtractedAddress] = useState(
    '742 Evergreen Heights, Koramangala 4th Block, Bengaluru, KA 560034'
  );
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const loadKYC = async () => {
    setLoading(true);
    try {
      const data = await api.getKYCStatus();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load KYC', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKYC();
  }, []);

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setStep(2); // OCR Extraction animation

    setTimeout(async () => {
      setStep(3); // Verified
      try {
        await api.submitKYC({
          document_type: docType,
          document_number: docNumber,
          extracted_name: extractedName,
          extracted_dob: extractedDob,
          extracted_address: extractedAddress,
        });
        loadKYC();
      } catch (err) {
        alert('Failed to submit KYC simulation');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-cyan-400" /> KYC Verification Demo
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Simulated OCR Engine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Simulated identity verification pipeline with OCR extraction and automated risk clearance.
        </p>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Hackathon Demo Notice:</strong> This module demonstrates an automated OCR document extraction workflow. It uses synthetic mock records and does NOT process real government IDs or legally binding KYC.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & OCR Simulation Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" /> Submit Document for OCR Extraction
          </h3>

          <form onSubmit={handleSimulatedUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value);
                  if (e.target.value === 'PAN') setDocNumber('ABCDE1234F');
                  else if (e.target.value === 'PASSPORT') setDocNumber('Z9876543');
                  else setDocNumber('XXXX-XXXX-8921');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="AADHAAR">Aadhaar Card (UIDAI Demo)</option>
                <option value="PAN">PAN Card (Income Tax Dept Demo)</option>
                <option value="PASSPORT">Indian Passport (Demo)</option>
                <option value="VOTER_ID">Voter ID (Election Commission Demo)</option>
              </select>
            </div>

            {/* Document Upload Simulation Area */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 text-center bg-slate-950/60 transition-colors">
              <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                Sample Document Loaded: <span className="text-cyan-400 font-mono">{docType}_sample_doc.png</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Ready for automated OCR parsing (Simulated 98% Confidence)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Extracted Name</label>
                <input
                  type="text"
                  required
                  value={extractedName}
                  onChange={(e) => setExtractedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Extracted ID Number</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Extracted Address</label>
              <input
                type="text"
                required
                value={extractedAddress}
                onChange={(e) => setExtractedAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-2"
            >
              {processing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" /> Running OCR Extraction...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Run Simulated Verification
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verification Status & History */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active Verification Status
          </h3>

          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Checking verification records...</div>
            ) : records.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No verification records logged yet.</div>
            ) : (
              records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rec.document_type}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        rec.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : rec.status === 'NEEDS_REVIEW'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p>
                      <strong className="text-slate-400">Document ID:</strong>{' '}
                      <span className="font-mono text-cyan-300">{rec.document_number}</span>
                    </p>
                    <p>
                      <strong className="text-slate-400">Extracted Name:</strong> {rec.extracted_name}
                    </p>
                    <p>
                      <strong className="text-slate-400">Address:</strong> {rec.extracted_address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                    <span>OCR Confidence: {(rec.ocr_confidence * 100).toFixed(0)}%</span>
                    <span>{formatDate(rec.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
