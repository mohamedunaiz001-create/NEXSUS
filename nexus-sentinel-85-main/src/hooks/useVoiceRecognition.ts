import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  VoiceCommandContext, 
  parseVoiceCommand, 
  speakVoiceResponse, 
  playVoiceFeedbackTone, 
  VoiceMatchResult 
} from '../utils/voiceCommander';

// Cross-browser SpeechRecognition types
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  lastCommand: VoiceMatchResult | null;
  lastExecutionResult: { success: boolean; message: string; timestamp: string } | null;
  error: string | null;
  ttsEnabled: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  setTtsEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  simulateVoiceInput: (phrase: string) => void;
  clearHistory: () => void;
}

export function useVoiceRecognition(context: VoiceCommandContext): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceMatchResult | null>(null);
  const [lastExecutionResult, setLastExecutionResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const contextRef = useRef(context);
  const ttsEnabledRef = useRef(ttsEnabled);

  // Keep refs synchronized
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  // Execute matching command helper
  const executeCommand = useCallback((spokenText: string) => {
    const matchResult = parseVoiceCommand(spokenText);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (matchResult) {
      setLastCommand(matchResult);
      const res = matchResult.command.execute(matchResult.match, spokenText, contextRef.current);
      
      setLastExecutionResult({
        success: res.success,
        message: res.message,
        timestamp: nowStr
      });

      // Voice Feedback TTS
      let feedbackText = '';
      if (typeof matchResult.command.voiceFeedbackText === 'function') {
        feedbackText = matchResult.command.voiceFeedbackText(matchResult.match, spokenText);
      } else {
        feedbackText = matchResult.command.voiceFeedbackText;
      }

      if (feedbackText && ttsEnabledRef.current) {
        speakVoiceResponse(feedbackText, true);
      }

      setError(null);
    } else {
      setLastExecutionResult({
        success: false,
        message: `Unrecognized command: "${spokenText}"`,
        timestamp: nowStr
      });
      playVoiceFeedbackTone('error');
      if (ttsEnabledRef.current) {
        speakVoiceResponse('Command not recognized. Say help or check available commands.', true);
      }
    }
  }, []);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognizer = new SpeechRecognitionClass();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = 'en-US';
    recognizer.maxAlternatives = 1;

    recognizer.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      playVoiceFeedbackTone('listen');
    };

    recognizer.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (final.trim()) {
        const cleanFinal = final.trim();
        setTranscript(cleanFinal);
        setInterimTranscript('');
        executeCommand(cleanFinal);
      }
    };

    recognizer.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // Normal silence timeout
        return;
      }
      if (event.error === 'aborted') {
        return;
      }
      console.warn('SpeechRecognition error:', event.error, event.message);
      setError(`Microphone error: ${event.error}`);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognizer.onend = () => {
      // If we intended to stay listening in continuous mode, restart
      if (isListeningRef.current) {
        try {
          recognizer.start();
        } catch {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognizer;

    return () => {
      isListeningRef.current = false;
      try {
        recognizer.abort();
      } catch {
        // ignore abort error on unmount
      }
    };
  }, [executeCommand]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }
    setError(null);
    try {
      isListeningRef.current = true;
      recognitionRef.current.start();
    } catch {
      // Already running or failed
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Simulate typed or preset voice command (works in all environments)
  const simulateVoiceInput = useCallback((phrase: string) => {
    setTranscript(phrase);
    setInterimTranscript('');
    executeCommand(phrase);
  }, [executeCommand]);

  const clearHistory = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setLastCommand(null);
    setLastExecutionResult(null);
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    lastCommand,
    lastExecutionResult,
    error,
    ttsEnabled,
    startListening,
    stopListening,
    toggleListening,
    setTtsEnabled,
    simulateVoiceInput,
    clearHistory
  };
}
