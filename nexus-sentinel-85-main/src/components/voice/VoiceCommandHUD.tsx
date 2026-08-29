import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  Terminal, 
  X, 
  ChevronRight, 
  Radio, 
  Play, 
  Layers, 
  CornerDownLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { UseVoiceRecognitionReturn } from '../../hooks/useVoiceRecognition';
import { VOICE_COMMANDS, VoiceCommandDef } from '../../utils/voiceCommander';

interface VoiceCommandHUDProps {
  voice: UseVoiceRecognitionReturn;
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCommandHUD: React.FC<VoiceCommandHUDProps> = ({
  voice,
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [testInput, setTestInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const categories = ['All', 'Lockdown & Defense', 'Incident Intake', 'Forensics & Logs', 'Agent Fleet', 'Intelligence & AI', 'System & UI'];

  const filteredCommands = VOICE_COMMANDS.filter(cmd => 
    selectedCategory === 'All' || cmd.category === selectedCategory
  );

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testInput.trim()) {
      voice.simulateVoiceInput(testInput.trim());
      setTestInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? 'bottom-14 right-4 w-96' 
          : 'inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn'
      }`}
      onClick={isMinimized ? undefined : onClose}
    >
      <div 
        id="voice-command-hud-card"
        className={`w-full bg-[#070314] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-xs font-mono select-none ${
          isMinimized ? 'max-h-80 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'max-w-3xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-primary)'
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border transition-all ${
              voice.isListening 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
            }`}>
              {voice.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-cyber text-slate-100 tracking-wide">
                  VOICE COMMAND INTERFACE
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  voice.isListening 
                    ? 'bg-rose-950 text-rose-300 border-rose-500/60 animate-pulse' 
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}>
                  {voice.isListening ? 'LISTENING (LIVE)' : 'STANDBY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Web Speech natural language tactical commands for emergency defense & operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio TTS Toggle */}
            <button
              type="button"
              id="voice-tts-toggle-btn"
              onClick={() => voice.setTtsEnabled(prev => !prev)}
              className={`p-1.5 rounded-lg border transition-colors ${
                voice.ttsEnabled 
                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300' 
                  : 'bg-black/40 border-slate-800 text-slate-500'
              }`}
              title={voice.ttsEnabled ? "Voice Response Synthesis (TTS) Active" : "Voice Response Synthesis Muted"}
            >
              {voice.ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Minimize / Maximize */}
            <button
              type="button"
              onClick={() => setIsMinimized(prev => !prev)}
              className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title={isMinimized ? "Expand HUD" : "Minimize HUD"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listening Status & Waveform Bar */}
        <div className="px-4 py-3 bg-[#05010e] border-b border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="toggle-mic-listening-btn"
              onClick={voice.toggleListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                voice.isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
            >
              {voice.isListening ? (
                <>
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Listening</span>
                </>
              )}
            </button>

            {/* Waveform Animation */}
            <div className="flex items-center gap-1 h-6 px-3 bg-black/50 rounded-lg border border-slate-800">
              {[0.4, 0.8, 1, 0.6, 0.9, 0.3, 0.7, 1, 0.5, 0.8, 0.4].map((scale, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-150 ${
                    voice.isListening 
                      ? 'bg-cyan-400 animate-pulse' 
                      : 'bg-slate-700 h-1.5'
                  }`}
                  style={{
                    height: voice.isListening ? `${Math.max(4, Math.random() * 20 * scale)}px` : '4px',
                    animationDelay: `${i * 70}ms`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live Transcript & Match Pill */}
          <div className="w-full sm:flex-1 text-right">
            {voice.interimTranscript ? (
              <div className="text-cyan-300 italic animate-pulse truncate text-xs">
                Hearing: "{voice.interimTranscript}"...
              </div>
            ) : voice.transcript ? (
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-400">Captured:</span>
                <span className="text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 truncate max-w-xs">
                  "{voice.transcript}"
                </span>
              </div>
            ) : (
              <div className="text-slate-500 text-[11px] italic">
                {voice.isListening ? 'Speak a natural command (e.g. "Engage lockdown", "Open case")...' : 'Click Start Listening or type below.'}
              </div>
            )}
          </div>
        </div>

        {/* Execution Feedback Notification */}
        {voice.lastExecutionResult && (
          <div className={`px-4 py-2 border-b text-xs flex items-center justify-between ${
            voice.lastExecutionResult.success 
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {voice.lastExecutionResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{voice.lastExecutionResult.message}</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono">{voice.lastExecutionResult.timestamp}</span>
          </div>
        )}

        {/* Main Body (Only when expanded) */}
        {!isMinimized && (
          <div className="p-4 overflow-y-auto space-y-4 max-h-[48vh] no-scrollbar">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Command Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredCommands.map((cmd) => (
                <div
                  key={cmd.id}
                  className="p-3 rounded-lg bg-black/40 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 font-cyber text-xs flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        {cmd.name}
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                        {cmd.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans mb-2 leading-relaxed">
                      {cmd.description}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Sample Voice Phrases:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cmd.examplePhrases.map((phrase, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => voice.simulateVoiceInput(phrase.replace(/^"|"$/g, ''))}
                            className="px-2 py-0.5 rounded bg-[#090514] hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-400 text-cyan-300 hover:text-white text-[10px] transition-colors flex items-center gap-1"
                            title="Click to execute this voice phrase"
                          >
                            <Play className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{phrase}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Natural Language Simulator Input Bar */}
        <div className="p-3 bg-black/60 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSimulateSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                id="voice-command-simulator-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder='Type or test a voice command (e.g. "Engage lockdown", "Open case", "Download logs")...'
                className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-[#05010e] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-200 text-xs font-mono placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-200"
                title="Execute command"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              Execute
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
