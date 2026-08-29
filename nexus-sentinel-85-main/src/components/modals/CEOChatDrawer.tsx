import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  Shield, 
  Terminal, 
  RefreshCw, 
  Paperclip, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  UploadCloud 
} from 'lucide-react';
import { CEONode, EvidenceArtifact } from '../../types';
import archonBg from '../../assets/images/archon_throne_bg_1786987761102.jpg';
import { isSafeUrl, sanitizeHtml, validateFileSafety } from '../../utils/security';
import { secureFetch } from '../../utils/apiClient';

interface CEOChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ceo: CEONode;
  initialPrompt?: string;
  onOpenEvidenceModal?: () => void;
  onAddArtifact?: (art: EvidenceArtifact) => void;
}

interface ChatAttachment {
  type: 'image' | 'file' | 'link';
  name: string;
  url?: string;
  size?: string;
}

interface Message {
  id: string;
  sender: 'ceo' | 'user';
  text: string;
  timestamp: string;
  attachment?: ChatAttachment;
  delegations?: string[];
}

export const CEOChatDrawer: React.FC<CEOChatDrawerProps> = ({ 
  isOpen, 
  onClose, 
  ceo,
  initialPrompt,
  onOpenEvidenceModal,
  onAddArtifact
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ceo',
      text: "Greetings, Commander. ARCHON online. All 8 specialist agents are deployed and synchronized on CASE-2024-017. You can instruct me directly, upload suspicious files, link threat screenshots, or feed intelligence links.",
      timestamp: '10:24:00',
    }
  ]);
  const [input, setInput] = useState('');
  const [currentAttachment, setCurrentAttachment] = useState<ChatAttachment | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');

  const chatFileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen && initialPrompt) {
      setInput(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (file: File) => {
    const safety = validateFileSafety(file);
    if (!safety.isSafe) {
      alert(safety.error || 'File rejected by security validation.');
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const att: ChatAttachment = {
          type: 'image',
          name: file.name,
          url: dataUrl,
          size: `${(file.size / 1024).toFixed(1)} KB`
        };
        setCurrentAttachment(att);

        // Optionally register to global evidence repository
        if (onAddArtifact) {
          onAddArtifact({
            id: `art-chat-${Date.now()}`,
            name: file.name,
            type: 'image',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            url: dataUrl,
            thumbnailUrl: dataUrl,
            uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            uploadedBy: 'Operator Chat Ingestion',
            caseId: 'CASE-2024-017',
            assignedAgent: 'IOC Extraction',
            status: 'Analyzing',
            tags: ['ChatUpload', 'Screenshot', 'Photo'],
            description: `Photo attached during ARCHON consultation: ${file.name}`
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      const att: ChatAttachment = {
        type: 'file',
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      };
      setCurrentAttachment(att);

      if (onAddArtifact) {
        onAddArtifact({
          id: `art-chat-${Date.now()}`,
          name: file.name,
          type: file.name.endsWith('.pcap') ? 'pcap' : file.name.endsWith('.ps1') ? 'code' : 'file',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          uploadedBy: 'Operator Chat Ingestion',
          caseId: 'CASE-2024-017',
          assignedAgent: file.name.endsWith('.pcap') ? 'Network Analysis' : 'Malware Analysis',
          status: 'Analyzing',
          tags: ['ChatUpload', 'Binary/Log'],
          description: `Forensic file attached during ARCHON consultation: ${file.name}`
        });
      }
    }
  };

  const handleAttachLink = () => {
    const rawLink = linkInputValue.trim();
    if (!rawLink) return;

    if (!isSafeUrl(rawLink)) {
      alert('Security violation: Only valid https:// or http:// URLs are allowed.');
      return;
    }

    const isImgUrl = /\.(png|jpg|jpeg|gif|webp|svg)($|\?)/i.test(rawLink);
    
    const att: ChatAttachment = {
      type: isImgUrl ? 'image' : 'link',
      name: isImgUrl ? 'threat_photo_link.png' : rawLink,
      url: rawLink,
      size: 'External URL'
    };
    setCurrentAttachment(att);

    if (onAddArtifact) {
      onAddArtifact({
        id: `art-chat-link-${Date.now()}`,
        name: rawLink,
        type: isImgUrl ? 'image' : 'link',
        url: rawLink,
        thumbnailUrl: isImgUrl ? rawLink : undefined,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        uploadedBy: 'Operator Chat Ingestion',
        caseId: 'CASE-2024-017',
        assignedAgent: 'Threat Intel',
        status: 'Ingested',
        tags: ['ChatLink', isImgUrl ? 'PhotoURL' : 'WebIntel'],
        description: `External link attached via chat: ${rawLink}`
      });
    }

    setLinkInputValue('');
    setShowLinkInput(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !currentAttachment) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input || (currentAttachment ? `Attached artifact: ${currentAttachment.name}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      attachment: currentAttachment || undefined
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const query = input;
    const attached = currentAttachment;
    setInput('');
    setCurrentAttachment(null);
    setIsLoading(true);

    try {
      // Dispatch to Server-Side AI Gateway (/api/ai/chat)
      const payloadMessages = updatedMessages.slice(-10).map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
        attachment: m.attachment
      }));

      const res = await secureFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: 'google',
          model: 'gemini-3.7-flash',
          messages: payloadMessages,
          temperature: 0.2,
          maxTokens: 2048,
          caseId: 'CASE-2024-017'
        })
      });

      const data = await res.json();

      let replyText = '';
      let delegationsList: string[] = ['THREAT INTEL', 'MALWARE ANALYSIS'];

      if (res.ok && data.success && data.data) {
        replyText = data.data.reply;
        delegationsList = data.data.delegations || delegationsList;
      } else {
        replyText = `ARCHON Response: Directive "${query.slice(0, 100)}" received. Specialist units deployed across active vectors.`;
      }

      const ceoMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ceo',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        delegations: delegationsList
      };
      setMessages(prev => [...prev, ceoMsg]);
    } catch (err: any) {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ceo',
        text: `ARCHON System Notice: Tactical dispatch processed for "${query}". Threat intelligence correlation active.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        delegations: ['THREAT INTEL', 'VERIFICATION AGENT']
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="ceo-chat-drawer"
        className="w-full max-w-lg bg-[#0c081e] border-l border-purple-500/40 h-full flex flex-col shadow-2xl text-slate-200"
      >
        {/* Hidden File Input */}
        <input 
          ref={chatFileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pcap,.bin,.exe,.log,.json,.ps1,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 bg-[#140c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg border border-purple-400/60 overflow-hidden relative shadow-[0_0_12px_rgba(168,85,247,0.5)] bg-[#070114] shrink-0">
              <img 
                src={archonBg} 
                alt="ARCHON CEO Avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cyber font-bold text-white text-sm">ARCHON — CEO COMMANDER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-purple-300 font-mono">
                {ceo.model} • Active Mandate Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onOpenEvidenceModal && (
              <button
                type="button"
                onClick={onOpenEvidenceModal}
                className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-all"
                title="Open Evidence Repository & Upload Hub"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Evidence Hub</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-purple-950/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1 mb-1 text-[9px] text-purple-400/80">
                <span>{m.sender === 'user' ? 'YOU' : 'ARCHON'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>
              <div className={`p-3 rounded-lg max-w-[88%] leading-relaxed space-y-2 ${
                m.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-[#180f33] text-slate-200 border border-purple-500/30 rounded-tl-none shadow-lg'
              }`}>
                {/* Render Attachment if present */}
                {m.attachment && (
                  <div className="p-2 rounded-md bg-black/40 border border-purple-400/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-200">
                      {m.attachment.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" /> :
                       m.attachment.type === 'file' ? <FileText className="w-3.5 h-3.5 text-purple-400" /> :
                       <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />}
                      <span className="font-bold truncate">{m.attachment.name}</span>
                    </div>

                    {m.attachment.type === 'image' && m.attachment.url && (
                      <div className="rounded overflow-hidden border border-purple-500/30 max-h-36">
                        <img 
                          src={m.attachment.url} 
                          alt="Attached Evidence" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {m.attachment.type === 'link' && m.attachment.url && (
                      <a 
                        href={m.attachment.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-cyan-300 underline flex items-center gap-1 break-all"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{m.attachment.url}</span>
                      </a>
                    )}
                  </div>
                )}

                <div>{m.text}</div>

                {m.delegations && (
                  <div className="mt-2 pt-2 border-t border-purple-500/20 flex flex-wrap gap-1">
                    <span className="text-[9px] text-purple-300 block w-full">Delegations:</span>
                    {m.delegations.map((d, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-200 text-[8.5px] border border-purple-500/40">
                        ⚡ {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Quick Directives */}
        <div className="px-4 py-2 bg-[#120a26] border-t border-purple-500/10 flex gap-1.5 overflow-x-auto text-[10px] font-mono no-scrollbar shrink-0">
          <button 
            onClick={() => { setInput("Run IOC cross-correlation across all feeds"); }}
            className="px-2 py-1 rounded bg-[#1f143d] text-purple-300 hover:text-white border border-purple-500/20 shrink-0"
          >
            Extract IOCs
          </button>
          <button 
            onClick={() => { setInput("Analyze PCAP network beacon frequency"); }}
            className="px-2 py-1 rounded bg-[#1f143d] text-purple-300 hover:text-white border border-purple-500/20 shrink-0"
          >
            PCAP Trace
          </button>
          <button 
            onClick={() => { setInput("Synthesize executive brief for CASE-2024-017"); }}
            className="px-2 py-1 rounded bg-[#1f143d] text-purple-300 hover:text-white border border-purple-500/20 shrink-0"
          >
            Draft Report
          </button>
        </div>

        {/* Pending Attachment Chip */}
        {currentAttachment && (
          <div className="px-3 py-1.5 bg-[#170a36] border-t border-purple-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              {currentAttachment.type === 'image' ? <ImageIcon className="w-4 h-4 text-fuchsia-400" /> :
               currentAttachment.type === 'file' ? <FileText className="w-4 h-4 text-purple-400" /> :
               <LinkIcon className="w-4 h-4 text-cyan-400" />}
              <span className="text-white font-semibold truncate">{currentAttachment.name}</span>
              <span className="text-purple-300 text-[10px]">({currentAttachment.size})</span>
            </div>
            <button
              onClick={() => setCurrentAttachment(null)}
              className="p-1 text-slate-400 hover:text-rose-300"
              title="Remove attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Link Input Bar */}
        {showLinkInput && (
          <div className="p-2 bg-[#12082b] border-t border-cyan-500/30 flex items-center gap-1.5 text-xs font-mono">
            <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            <input 
              type="url"
              value={linkInputValue}
              onChange={(e) => setLinkInputValue(e.target.value)}
              placeholder="Paste Photo URL or Threat Intel Link..."
              className="flex-1 px-2.5 py-1.5 rounded bg-[#1a0f3d] border border-cyan-500/30 text-white text-xs placeholder-slate-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAttachLink())}
            />
            <button
              type="button"
              onClick={handleAttachLink}
              className="px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Attach
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Footer with Attachment Actions */}
        <form onSubmit={handleSend} className="p-3 bg-[#110924] border-t border-purple-500/20 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentAttachment ? "Add directive with attached artifact..." : "Instruct CEO ARCHON or attach files/photos..."}
              className="flex-1 px-3 py-2 rounded-lg bg-[#180e35] border border-purple-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Attachment Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#180e38] hover:bg-[#25154d] text-purple-300 hover:text-white border border-purple-500/30 transition-colors"
                title="Upload file or screenshot photo"
              >
                <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                <span>File / Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#180e38] hover:bg-[#25154d] text-cyan-300 hover:text-white border border-cyan-500/30 transition-colors"
                title="Link web URL or online photo"
              >
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Link URL</span>
              </button>
            </div>

            {onOpenEvidenceModal && (
              <button
                type="button"
                onClick={onOpenEvidenceModal}
                className="text-purple-400 hover:text-purple-300 text-[10.5px] underline flex items-center gap-1"
              >
                <span>Browse All Evidence</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

