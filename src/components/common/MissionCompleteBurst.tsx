import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';

interface MissionCompleteBurstProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  missionTitle?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'square' | 'spark';
  rotation: number;
  vRot: number;
}

export const MissionCompleteBurst: React.FC<MissionCompleteBurstProps> = ({
  isOpen,
  onClose,
  caseId = '',
  missionTitle = 'Operation Blackout Defiance'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-dismiss after 3.8 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3800);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const originX = width / 2;
    const originY = height / 2;

    const colors = [
      '#10b981', // Emerald
      '#34d399', // Mint
      '#06b6d4', // Cyan
      '#a855f7', // Purple
      '#c084fc', // Light Violet
      '#fbbf24', // Amber/Gold
      '#ffffff'  // Pure Spark White
    ];

    const particles: Particle[] = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 8.5;
      const shapeType: Particle['shape'] = i % 3 === 0 ? 'spark' : i % 2 === 0 ? 'square' : 'circle';

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: shapeType === 'spark' ? 2 + Math.random() * 4 : 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.018,
        shape: shapeType,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // air drag
        p.vy *= 0.96;
        p.vy += 0.04; // subtle gravity
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          // Spark / Diamond star
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size * 0.4, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size * 0.4, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="mission-complete-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto select-none"
        >
          {/* Subtle Dim Backdrop with Cyber Grid Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070414]/75 backdrop-blur-md"
          />

          {/* Canvas for Particle Burst */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          />

          {/* Expanding Shockwave Glow Rings */}
          <motion.div 
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full border-2 border-emerald-400/80 pointer-events-none z-10 shadow-[0_0_50px_rgba(16,185,129,0.8)]"
          />
          <motion.div 
            initial={{ scale: 0.1, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.0, delay: 0.15, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full border border-cyan-400/60 pointer-events-none z-10 shadow-[0_0_30px_rgba(6,182,212,0.6)]"
          />
          <motion.div 
            initial={{ scale: 0.1, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full border border-purple-400/60 pointer-events-none z-10 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
          />

          {/* Central Cyber Celebration Banner */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative z-20 max-w-md w-full mx-4 rounded-2xl bg-gradient-to-b from-[#0e1f18] via-[#091510] to-[#040b08] border-2 border-emerald-500/80 p-6 text-center shadow-[0_0_40px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {/* Close Button */}
            <button
              type="button"
              id="close-mission-burst-btn"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white transition-colors"
              title="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Hexagon Badge */}
            <div className="mx-auto mb-4 relative flex items-center justify-center w-16 h-16">
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.7)]"
              >
                <ShieldCheck className="w-9 h-9 text-slate-950 stroke-[2.2]" />
              </motion.div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-slate-950" />
                </span>
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 uppercase shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>MISSION ACCOMPLISHED</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-cyber font-bold text-white tracking-wide mt-1">
                CASE RESOLVED
              </h3>

              <div className="text-xs font-mono text-emerald-400/90 font-semibold">
                {caseId} • {missionTitle}
              </div>
            </div>

            {/* Status Details */}
            <div className="mt-4 p-3 rounded-xl bg-[#04100b]/90 border border-emerald-500/30 text-left space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Incident Status:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-500/50">
                  RESOLVED // SECURE
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Threat Mitigation:</span>
                <span className="text-white font-bold">100% (Zero Active Vectors)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Validation Score:</span>
                <span className="text-emerald-400 font-bold">99.8% (CEO Verified)</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                id="dismiss-mission-complete-btn"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-98"
              >
                Continue Operations
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
