import React, { useEffect, useRef, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Volume2, 
  VolumeX, 
  X,
  Flame,
  Radio
} from 'lucide-react';

interface EmergencyBannerProps {
  threatScore: number;
  threatThreshold: number;
  onDeployCountermeasures: () => void;
  onLockdownPorts: () => void;
  onDisengageOverride: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  threatScore,
  threatThreshold,
  onDeployCountermeasures,
  onLockdownPorts,
  onDisengageOverride
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);

  // Web Audio API subtle radar / emergency alert pulse
  const playAlertPulse = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      if (!audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  };

  useEffect(() => {
    if (isAudioEnabled) {
      playAlertPulse();
      intervalRef.current = setInterval(() => {
        playAlertPulse();
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAudioEnabled]);

  return (
    <div 
      id="emergency-override-banner"
      className="relative z-30 w-full bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-b-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)] text-white px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 animate-in slide-in-from-top duration-300 select-none overflow-hidden"
    >
      {/* Top Hazard Moving Border */}
      <div className="absolute top-0 left-0 right-0 h-1 emergency-hazard-bar" />

      {/* Left Alert Label & Strobe Beacon */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600 border border-white/50 text-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)] shrink-0">
          <Flame className="w-5 h-5 animate-bounce" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-cyber font-black tracking-wider text-xs sm:text-sm text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-rose-300 animate-ping" />
              EMERGENCY OVERRIDE • DEFCON 1 ACTIVATED
            </span>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-rose-400 text-[10px] font-mono font-bold text-rose-300">
              THREAT SURGE: {threatScore}% (THRESHOLD: {threatThreshold}%)
            </span>
          </div>
          <p className="text-[11px] font-mono text-rose-200/90 hidden md:block">
            High-severity threat surge detected. All 8 specialist agents locked in autonomous containment protocols.
          </p>
        </div>
      </div>

      {/* Right Emergency Control Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Audio Siren Toggle */}
        <button
          type="button"
          onClick={() => setIsAudioEnabled(prev => !prev)}
          className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
            isAudioEnabled 
              ? 'bg-rose-500 text-white border-white shadow-[0_0_10px_rgba(244,63,94,0.8)]' 
              : 'bg-black/40 border-rose-400/40 text-rose-200 hover:bg-rose-900/60'
          }`}
          title={isAudioEnabled ? "Mute Emergency Siren Pulse" : "Unmute Emergency Siren Pulse"}
        >
          {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isAudioEnabled ? 'Siren On' : 'Siren Audio'}</span>
        </button>

        {/* Deploy Countermeasures */}
        <button
          type="button"
          onClick={onDeployCountermeasures}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all active:scale-95"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Deploy Countermeasures</span>
        </button>

        {/* Lockdown Ports */}
        <button
          type="button"
          onClick={onLockdownPorts}
          className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-rose-400 text-rose-200 hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all hidden sm:flex"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Lockdown Ports</span>
        </button>

        {/* Disengage / Reset */}
        <button
          type="button"
          onClick={onDisengageOverride}
          className="p-1.5 rounded-lg bg-black/50 hover:bg-black border border-rose-500/40 text-rose-300 hover:text-white transition-colors"
          title="Disengage Emergency Override & Normalize UI"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
