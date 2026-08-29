import React from 'react';
import { IOCItem } from '../../types';
import { X, ShieldAlert, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

interface IOCDetailModalProps {
  ioc: IOCItem | null;
  onClose: () => void;
}

export const IOCDetailModal: React.FC<IOCDetailModalProps> = ({ ioc, onClose }) => {
  if (!ioc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="ioc-detail-modal"
        className="w-full max-w-lg bg-[#0e0a22] border border-purple-500/40 rounded-xl p-5 shadow-2xl space-y-4 text-slate-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-purple-200">
                {ioc.value}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Type: {ioc.type} • Status: <span className="text-rose-400 font-semibold">{ioc.severity}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-purple-950/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">CONFIDENCE</span>
            <span className="text-emerald-400 font-bold">{ioc.confidence}%</span>
          </div>
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">THREAT ACTOR</span>
            <span className="text-purple-300 font-bold">{ioc.threatActor || 'Unknown'}</span>
          </div>
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">ORIGIN COUNTRY</span>
            <span className="text-slate-200 font-bold">{ioc.country || 'Global'}</span>
          </div>
        </div>

        <div className="p-3 rounded bg-[#140c2a] border border-purple-500/20 text-xs font-mono space-y-1 text-slate-300">
          <span className="text-[10px] text-purple-400 uppercase font-bold block">Feed Enrichment</span>
          <div>VirusTotal Detection Ratio: <span className="text-rose-400 font-bold">58 / 72 engines</span></div>
          <div>AbuseIPDB Score: <span className="text-rose-400 font-bold">100% (High Confidence Malicious)</span></div>
          <div>First Observed: <span className="text-slate-400">{ioc.firstSeen}</span></div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
