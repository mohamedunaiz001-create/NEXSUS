import React from 'react';
import { ProviderNode } from '../../types';
import { ArrowUpRight, Cpu, Key, Zap, CheckCircle2, Sliders } from 'lucide-react';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface ProviderStatusProps {
  providers?: ProviderNode[];
  onManage?: () => void;
  onSelectProvider?: (providerId: string) => void;
}

export const ProviderStatus: React.FC<ProviderStatusProps> = ({ 
  providers = [], 
  onManage,
  onSelectProvider 
}) => {
  const activeProviders = providers.filter(p => p.enabled !== false);
  const customKeysCount = providers.filter(p => p.isCustomKey).length;

  return (
    <div 
      id="ai-provider-status-card"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-cyber font-bold text-white tracking-wider">
            AI PROVIDER HUB
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950/80 border border-purple-500/30 text-purple-300">
            {activeProviders.length} Active
          </span>
        </div>

        {onManage && (
          <button 
            type="button"
            id="manage-providers-btn"
            onClick={onManage}
            className="text-[10px] font-mono text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 hover:border-purple-400 px-2 py-0.5 rounded flex items-center gap-1 transition-all"
            title="Configure AI Providers, API Keys, and Custom Endpoints"
          >
            <Key className="w-2.5 h-2.5 text-purple-300" />
            <span>Manage Keys</span>
            <ArrowUpRight className="w-3 h-3 text-purple-400" />
          </button>
        )}
      </div>

      {/* Providers List */}
      <div className="space-y-1.5 overflow-y-auto max-h-52 text-[10.5px] font-mono pr-0.5 custom-scrollbar">
        {activeProviders.map((p) => {
          const isCustom = p.isCustomKey;
          return (
            <div 
              key={p.id}
              onClick={() => {
                if (onSelectProvider) onSelectProvider(p.id);
                else if (onManage) onManage();
              }}
              className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[#12082b]/60 hover:bg-[#1b0f3e] border border-purple-500/10 hover:border-purple-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                {/* Provider Badge Icon */}
                <div 
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 border"
                  style={{
                    backgroundColor: '#1b0e3b',
                    borderColor: p.iconColor || '#a855f7',
                    color: p.iconColor || '#c084fc'
                  }}
                >
                  {p.name.charAt(0)}
                </div>
                
                <div className="truncate flex items-center gap-1.5">
                  <span className="text-slate-200 truncate font-semibold group-hover:text-purple-200 transition-colors">
                    {p.name}
                  </span>
                  {p.model && (
                    <span className="text-[9px] text-purple-400/80 hidden sm:inline truncate max-w-[110px]">
                      ({p.model.replace('anthropic/', '').replace('deepseek/', '').replace('google/', '')})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isCustom && (
                  <span className="px-1 py-0.2 rounded text-[8.5px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    KEY
                  </span>
                )}

                {p.latency && (
                  <span className="text-[9px] text-cyan-400 font-mono">
                    {p.latency}
                  </span>
                )}

                <span className="flex items-center gap-1 text-[9.5px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-green" />
                  {p.health || 98}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Status summary */}
      <div className="pt-1.5 mt-1 border-t border-purple-500/15 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-yellow-400" />
          <span>Multi-Engine Smart Routing</span>
        </span>
        {customKeysCount > 0 && (
          <span className="text-emerald-400 font-bold">
            {customKeysCount} Custom Key{customKeysCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

