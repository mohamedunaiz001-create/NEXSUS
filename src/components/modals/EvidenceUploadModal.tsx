import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  Hash, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Filter, 
  ShieldAlert, 
  Copy, 
  Check, 
  Terminal,
  Paperclip,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { EvidenceArtifact, SpecialistAgent } from '../../types';
import { isSafeUrl, validateFileSafety } from '../../utils/security';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifacts?: EvidenceArtifact[];
  onAddArtifact: (artifact: EvidenceArtifact) => void;
  onDeleteArtifact?: (id: string) => void;
  agents?: SpecialistAgent[];
  currentCaseId?: string;
  onDispatchToAgent?: (artifact: EvidenceArtifact, agentId: string) => void;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  artifacts = [],
  onAddArtifact,
  onDeleteArtifact,
  agents = [],
  currentCaseId = '',
  onDispatchToAgent
}) => {
  const [activeTab, setActiveTab] = useState<'upload-file' | 'link-photo' | 'link-url' | 'paste-code' | 'gallery'>('upload-file');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // File Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileContentPreview, setFileContentPreview] = useState<string>('');
  const [fileDescription, setFileDescription] = useState<string>('');
  const [fileTags, setFileTags] = useState<string>('Screenshot, Artifact, Memory');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('ioc-specialist');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Photo URL Form State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [photoDescription, setPhotoDescription] = useState<string>('');
  const [photoTags, setPhotoTags] = useState<string>('Screenshot, Photo, Capture');

  // External Web URL Form State
  const [webUrl, setWebUrl] = useState<string>('');
  const [webTitle, setWebTitle] = useState<string>('');
  const [webDescription, setWebDescription] = useState<string>('');
  const [webTags, setWebTags] = useState<string>('Threat Feed, Intel, OTX');

  // Raw Code/Snippet State
  const [codeName, setCodeName] = useState<string>('');
  const [codeType, setCodeType] = useState<'powershell' | 'yara' | 'json' | 'log'>('powershell');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [codeTags, setCodeTags] = useState<string>('Code, Script, AMSI');
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);

  // Lightbox Preview State
  const [lightboxArtifact, setLightboxArtifact] = useState<EvidenceArtifact | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Helper to generate realistic SHA-256 hash
  const generateMockSha256 = () => {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleFileSelect = (file: File) => {
    const safety = validateFileSafety(file);
    if (!safety.isSafe) {
      setSecurityAlert(safety.error || 'File failed safety check.');
      return;
    }
    setSecurityAlert(null);
    setSelectedFile(file);
    
    // Auto-detect image vs text
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
      // Read first 2KB for text preview if small
      if (file.size < 500000) {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          setFileContentPreview((e.target?.result as string).slice(0, 1000));
        };
        textReader.readAsText(file);
      } else {
        setFileContentPreview(`[Binary Payload / Large Capture file: ${(file.size / (1024 * 1024)).toFixed(2)} MB]`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmitFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const safety = validateFileSafety(selectedFile);
    if (!safety.isSafe) {
      setSecurityAlert(safety.error || 'Upload blocked by security policy.');
      return;
    }
    setSecurityAlert(null);

    const isImg = selectedFile.type.startsWith('image/');
    const isPcap = selectedFile.name.endsWith('.pcap') || selectedFile.name.endsWith('.cap');
    const isCode = selectedFile.name.endsWith('.ps1') || selectedFile.name.endsWith('.py') || selectedFile.name.endsWith('.js') || selectedFile.name.endsWith('.sh');

    let detectedType: EvidenceArtifact['type'] = 'file';
    if (isImg) detectedType = 'image';
    else if (isPcap) detectedType = 'pcap';
    else if (isCode) detectedType = 'code';

    const newArtifact: EvidenceArtifact = {
      id: `art-${Date.now()}`,
      name: selectedFile.name,
      type: detectedType,
      size: selectedFile.size > 1024 * 1024 
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${(selectedFile.size / 1024).toFixed(1)} KB`,
      url: filePreviewUrl || undefined,
      thumbnailUrl: filePreviewUrl || undefined,
      mimeType: selectedFile.type || 'application/octet-stream',
      sha256: generateMockSha256(),
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      uploadedBy: 'Analyst Security Ops',
      caseId: currentCaseId,
      assignedAgent: agents.find(a => a.id === assignedAgentId)?.name || 'IOC Extraction',
      status: 'Analyzing',
      tags: fileTags.split(',').map(t => t.trim()).filter(Boolean),
      description: fileDescription || `Uploaded forensic file: ${selectedFile.name}`,
      previewContent: fileContentPreview || undefined,
      extractedIOCsCount: Math.floor(Math.random() * 6) + 2
    };

    onAddArtifact(newArtifact);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setFileContentPreview('');
    setFileDescription('');
    setActiveTab('gallery');
  };

  const handleSubmitPhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = photoUrl.trim();
    if (!cleanUrl) return;

    if (!isSafeUrl(cleanUrl)) {
      setSecurityAlert('URL rejected. Only secure HTTPS/HTTP external URLs are allowed (javascript:, data:, file:, vbscript:, blob: are strictly forbidden).');
      return;
    }
    setSecurityAlert(null);

    const newArtifact: EvidenceArtifact = {
      id: `art-photo-${Date.now()}`,
      name: photoName.trim() || 'threat_screenshot_capture.png',
      type: 'image',
      size: '1.24 MB',
      url: cleanUrl,
      thumbnailUrl: cleanUrl,
      mimeType: 'image/jpeg',
      sha256: generateMockSha256(),
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      uploadedBy: 'Incident Response Lead',
      caseId: currentCaseId,
      assignedAgent: agents.find(a => a.id === assignedAgentId)?.name || 'Threat Intel',
      status: 'Parsed',
      tags: photoTags.split(',').map(t => t.trim()).filter(Boolean),
      description: photoDescription || 'External screenshot image artifact linked for visual forensic inspection.',
      extractedIOCsCount: 4
    };

    onAddArtifact(newArtifact);
    setPhotoUrl('');
    setPhotoName('');
    setPhotoDescription('');
    setActiveTab('gallery');
  };

  const handleSubmitWebUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = webUrl.trim();
    if (!cleanUrl) return;

    if (!isSafeUrl(cleanUrl)) {
      setSecurityAlert('URL rejected. Only secure HTTPS/HTTP external URLs are allowed (javascript:, data:, file:, vbscript:, blob: are strictly forbidden).');
      return;
    }
    setSecurityAlert(null);

    const newArtifact: EvidenceArtifact = {
      id: `art-url-${Date.now()}`,
      name: webTitle.trim() || cleanUrl,
      type: 'link',
      url: cleanUrl,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      uploadedBy: 'Threat Researcher',
      caseId: currentCaseId,
      assignedAgent: agents.find(a => a.id === assignedAgentId)?.name || 'Threat Intel',
      status: 'Ingested',
      tags: webTags.split(',').map(t => t.trim()).filter(Boolean),
      description: webDescription || `External intelligence URL source: ${cleanUrl}`,
      extractedIOCsCount: Math.floor(Math.random() * 8) + 3
    };

    onAddArtifact(newArtifact);
    setWebUrl('');
    setWebTitle('');
    setWebDescription('');
    setActiveTab('gallery');
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSnippet.trim()) return;

    const newArtifact: EvidenceArtifact = {
      id: `art-code-${Date.now()}`,
      name: codeName.trim() || `script_payload.${codeType === 'powershell' ? 'ps1' : codeType === 'yara' ? 'yar' : 'txt'}`,
      type: 'code',
      size: `${(codeSnippet.length / 1024).toFixed(1)} KB`,
      mimeType: 'text/plain',
      sha256: generateMockSha256(),
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      uploadedBy: 'EDR Collector',
      caseId: currentCaseId,
      assignedAgent: agents.find(a => a.id === assignedAgentId)?.name || 'Code Review',
      status: 'Flagged',
      tags: codeTags.split(',').map(t => t.trim()).filter(Boolean),
      description: `Raw snippet uploaded for automated static inspection (${codeType.toUpperCase()}).`,
      previewContent: codeSnippet,
      extractedIOCsCount: Math.floor(Math.random() * 5) + 2
    };

    onAddArtifact(newArtifact);
    setCodeSnippet('');
    setCodeName('');
    setActiveTab('gallery');
  };

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredArtifacts = artifacts.filter(art => {
    if (filterType === 'all') return true;
    if (filterType === 'photos') return art.type === 'image';
    if (filterType === 'files') return art.type === 'file' || art.type === 'pcap';
    if (filterType === 'links') return art.type === 'link';
    if (filterType === 'code') return art.type === 'code' || art.type === 'log';
    return true;
  });

  return (
    <div 
      id="evidence-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div 
        className="w-full max-w-4xl bg-[#090517] border-2 border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col max-h-[90vh] overflow-hidden text-slate-200 my-auto"
        style={{
          borderColor: 'var(--color-panel-border)'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex items-center justify-between bg-[#110826] shrink-0"
          style={{
            borderColor: 'var(--color-panel-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-cyber font-bold text-white tracking-wide">
                  EVIDENCE & ARTIFACTS INGESTION
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                  {artifacts.length} Loaded
                </span>
              </div>
              <p className="text-xs font-mono text-purple-300/80">
                Upload files, link threat photos/screenshots, ingest intelligence URLs, and dispatch to specialist agents.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-slate-400 hover:text-white border border-purple-500/20 transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-500/20 bg-[#0c061d] px-3 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('upload-file')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'upload-file'
                ? 'border-purple-400 text-purple-200 bg-purple-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload File / Photo</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('link-photo')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'link-photo'
                ? 'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Link Photo URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link-url')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'link-url'
                ? 'border-cyan-400 text-cyan-200 bg-cyan-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Link Web Intel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste-code')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'paste-code'
                ? 'border-amber-400 text-amber-200 bg-amber-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Paste Code / Log</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ml-auto ${
              activeTab === 'gallery'
                ? 'border-emerald-400 text-emerald-200 bg-emerald-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Artifact Gallery ({artifacts.length})</span>
          </button>
        </div>

        {securityAlert && (
          <div className="mx-4 mt-3 p-3 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center justify-between gap-3 text-red-200 text-xs font-mono animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{securityAlert}</span>
            </div>
            <button 
              onClick={() => setSecurityAlert(null)}
              className="text-red-400 hover:text-red-200 font-bold px-1.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* TAB 1: File & Photo Drag-and-Drop Upload */}
          {activeTab === 'upload-file' && (
            <form onSubmit={handleSubmitFileUpload} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : selectedFile
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-purple-500/30 hover:border-purple-400/60 bg-[#0e0722]/70 hover:bg-[#130b2e]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  accept="image/*,.pcap,.cap,.exe,.dll,.bin,.zip,.tar,.gz,.json,.log,.csv,.pdf,.ps1,.py,.txt"
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    {filePreviewUrl ? (
                      <div className="max-w-xs mx-auto rounded-lg overflow-hidden border border-purple-500/40 shadow-md">
                        <img 
                          src={filePreviewUrl} 
                          alt="Uploaded Preview" 
                          className="w-full h-36 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    
                    <div>
                      <div className="text-white font-cyber font-bold text-sm">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs font-mono text-purple-300">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Binary/Data'}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                      <CheckCircle2 className="w-3 h-3" /> File ready for extraction
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                      <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    <div className="text-sm font-cyber font-bold text-slate-200">
                      Drag & Drop files or photos here, or click to browse
                    </div>
                    <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                      Supports threat screenshots, PCAP traffic captures, malicious binaries, memory logs, and YARA scripts (up to 50MB).
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Assign Specialist Agent for Extraction
                  </label>
                  <select
                    value={assignedAgentId}
                    onChange={(e) => setAssignedAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Threat Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={fileTags}
                    onChange={(e) => setFileTags(e.target.value)}
                    placeholder="e.g. Screenshot, Ransomware, PCAP"
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Forensic Notes / Description
                  </label>
                  <input
                    type="text"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Brief description of origin, hostname, or attack vector..."
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setFilePreviewUrl(null); }}
                  className="px-4 py-2 rounded-lg bg-[#180e35] hover:bg-[#221447] text-slate-300 text-xs font-mono transition-all"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-xs font-cyber font-bold tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ingest & Dispatch File</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Link Photo / Screenshot by URL */}
          {activeTab === 'link-photo' && (
            <form onSubmit={handleSubmitPhotoUrl} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/30 space-y-2">
                <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Link External Photo / Screenshot URL</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Provide a direct URL to an image or forensic screenshot (e.g. ransomware screen capture, phishing portal snapshot, desktop capture).
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Photo / Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/screenshot_ransom.png"
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-fuchsia-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400"
                  />
                </div>

                {photoUrl.trim() && (
                  <div className="p-3 rounded-lg bg-[#0c051a] border border-purple-500/20">
                    <span className="text-[10px] text-slate-400 block mb-1">Live Photo Preview:</span>
                    <div className="max-w-sm rounded-lg overflow-hidden border border-purple-500/40 shadow-lg">
                      <img 
                        src={photoUrl} 
                        alt="URL Preview" 
                        className="w-full h-40 object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Artifact Label / Filename
                    </label>
                    <input
                      type="text"
                      value={photoName}
                      onChange={(e) => setPhotoName(e.target.value)}
                      placeholder="e.g. c2_dashboard_snapshot.jpg"
                      className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-fuchsia-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={photoTags}
                      onChange={(e) => setPhotoTags(e.target.value)}
                      placeholder="e.g. Screenshot, Phishing, Ransom"
                      className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-fuchsia-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Forensic Context
                  </label>
                  <input
                    type="text"
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    placeholder="Description of visual elements or indicators..."
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-fuchsia-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!photoUrl.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-cyber font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.4)] disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Attach Photo Artifact</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Link External Web URL / Threat Feed */}
          {activeTab === 'link-url' && (
            <form onSubmit={handleSubmitWebUrl} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <LinkIcon className="w-4 h-4" />
                  <span>Ingest External Threat Intel Feed / URL</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Link an AlienVault OTX Pulse, VirusTotal sample report, GitHub advisory, or Shodan IP host link.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Target URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://otx.alienvault.com/pulse/65a98..."
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Feed Title / Alias
                    </label>
                    <input
                      type="text"
                      value={webTitle}
                      onChange={(e) => setWebTitle(e.target.value)}
                      placeholder="e.g. External threat-intelligence reference"
                      className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={webTags}
                      onChange={(e) => setWebTags(e.target.value)}
                      placeholder="e.g. OTX, Threat Actor, Feed"
                      className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Description & Extraction Directives
                  </label>
                  <input
                    type="text"
                    value={webDescription}
                    onChange={(e) => setWebDescription(e.target.value)}
                    placeholder="What indicators should be scraped from this link?"
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!webUrl.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Harvest from URL</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Paste Raw Code / Log / YARA */}
          {activeTab === 'paste-code' && (
            <form onSubmit={handleSubmitCode} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <FileCode className="w-4 h-4" />
                  <span>Paste Code / YARA Rule / Raw Log Dump</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Directly paste script payloads or firewall syslog lines for automated tokenization and static code analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Snippet Name / Identifier
                  </label>
                  <input
                    type="text"
                    value={codeName}
                    onChange={(e) => setCodeName(e.target.value)}
                    placeholder="e.g. stage2_dropper.ps1"
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-amber-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Payload Format
                  </label>
                  <select
                    value={codeType}
                    onChange={(e) => setCodeType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#140b2e] border border-amber-500/30 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="powershell">PowerShell Script (.ps1)</option>
                    <option value="yara">YARA Detection Rule (.yar)</option>
                    <option value="json">STIX / JSON Telemetry (.json)</option>
                    <option value="log">Firewall / Syslog Dump (.log)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Raw Code / Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder={`$bytes = [System.Convert]::FromBase64String("TVqQAAMAAAAEAAAA...")\n[System.Reflection.Assembly]::Load($bytes)`}
                  className="w-full p-3 rounded-lg bg-[#0c0618] border border-amber-500/30 text-amber-200 font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400 custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!codeSnippet.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-cyber font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Submit Code Artifact</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: Artifact Gallery & Ingested Inventory */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Filter Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                <div className="flex items-center gap-1 bg-[#120926] p-1 rounded-lg border border-purple-500/30">
                  {['all', 'photos', 'files', 'links', 'code'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-all ${
                        filterType === f
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f === 'photos' ? 'Photos & Captures' : f === 'files' ? 'Files & PCAPs' : f === 'links' ? 'Web Feeds' : f}
                    </button>
                  ))}
                </div>

                <span className="text-slate-400 text-[11px]">
                  Showing <strong className="text-purple-300">{filteredArtifacts.length}</strong> artifacts
                </span>
              </div>

              {/* Artifacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredArtifacts.map((art) => {
                  const isImage = art.type === 'image';
                  const isPcap = art.type === 'pcap';
                  const isCode = art.type === 'code';
                  const isLink = art.type === 'link';

                  return (
                    <div
                      key={art.id}
                      className="rounded-xl bg-[#0e0724] border border-purple-500/30 p-3 space-y-2.5 hover:border-purple-400/60 transition-all group flex flex-col justify-between shadow-md"
                    >
                      {/* Top Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider ${
                            isImage ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40' :
                            isPcap ? 'bg-purple-950 text-purple-300 border border-purple-500/40' :
                            isLink ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                            isCode ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            'bg-slate-900 text-slate-300 border border-slate-700'
                          }`}>
                            {art.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {art.uploadedAt}
                          </span>
                        </div>

                        {/* Title & Icon */}
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
                            {isImage ? <ImageIcon className="w-4 h-4 text-fuchsia-400" /> :
                             isPcap ? <Terminal className="w-4 h-4 text-purple-400" /> :
                             isLink ? <LinkIcon className="w-4 h-4 text-cyan-400" /> :
                             isCode ? <FileCode className="w-4 h-4 text-amber-400" /> :
                             <FileText className="w-4 h-4 text-slate-300" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-cyber font-bold text-xs truncate" title={art.name}>
                              {art.name}
                            </div>
                            <div className="text-[10px] font-mono text-purple-300/80 truncate">
                              {art.size || 'External Feed'} • Assigned: {art.assignedAgent || 'ARCHON'}
                            </div>
                          </div>
                        </div>

                        {/* Image Thumbnail Preview if available */}
                        {isImage && (art.thumbnailUrl || art.url) && (
                          <div 
                            onClick={() => setLightboxArtifact(art)}
                            className="relative w-full h-24 rounded-lg overflow-hidden border border-purple-500/30 cursor-pointer group/img"
                          >
                            <img 
                              src={art.thumbnailUrl || art.url} 
                              alt={art.name}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="px-2 py-1 rounded bg-black/75 text-white text-[10px] font-mono flex items-center gap-1">
                                <Maximize2 className="w-3 h-3" /> Zoom Photo
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {art.description && (
                          <p className="text-[10.5px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
                            {art.description}
                          </p>
                        )}

                        {/* SHA-256 Hash Copy */}
                        {art.sha256 && (
                          <div 
                            onClick={(e) => handleCopyHash(art.sha256!, e)}
                            className="cursor-pointer flex items-center justify-between p-1.5 rounded bg-[#060212] border border-purple-500/20 text-[9.5px] font-mono text-slate-400 hover:text-white hover:border-purple-400/40 transition-colors"
                            title="Click to copy SHA-256 hash"
                          >
                            <span className="truncate mr-1 font-mono">
                              SHA: {art.sha256.slice(0, 16)}...
                            </span>
                            {copiedHash === art.sha256 ? (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-purple-400 shrink-0" />
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {art.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-[#1b0d36] text-purple-300 border border-purple-500/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between gap-1 text-[10.5px] font-mono">
                        <div className="flex items-center gap-1">
                          {art.url && (
                            <a
                              href={art.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-[#180e35] hover:bg-[#25154f] text-slate-300 hover:text-white transition-colors"
                              title="Open External Resource"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setLightboxArtifact(art)}
                            className="p-1 rounded bg-[#180e35] hover:bg-[#25154f] text-slate-300 hover:text-white transition-colors"
                            title="Inspect Artifact Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {onDeleteArtifact && (
                          <button
                            type="button"
                            onClick={() => onDeleteArtifact(art.id)}
                            className="p-1 rounded text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                            title="Delete artifact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d0720] border-t border-purple-500/20 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target Case: <strong className="text-purple-200">{currentCaseId}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white transition-all font-semibold"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Photos & Artifact Inspection */}
      {lightboxArtifact && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxArtifact(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-[#0d0721] border-2 border-purple-500/60 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-200 max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40 uppercase">
                  {lightboxArtifact.type}
                </span>
                <h4 className="font-cyber font-bold text-white text-base truncate">
                  {lightboxArtifact.name}
                </h4>
              </div>
              <button
                onClick={() => setLightboxArtifact(null)}
                className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If image, display high-res preview */}
            {lightboxArtifact.type === 'image' && (lightboxArtifact.url || lightboxArtifact.thumbnailUrl) && (
              <div className="rounded-xl overflow-hidden border border-purple-500/40 shadow-inner bg-black flex items-center justify-center">
                <img 
                  src={lightboxArtifact.url || lightboxArtifact.thumbnailUrl} 
                  alt={lightboxArtifact.name}
                  className="max-h-96 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* If code/log snippet, display formatted block */}
            {lightboxArtifact.previewContent && (
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-purple-300">Raw Content Preview:</span>
                <pre className="p-3 rounded-xl bg-[#05020f] border border-purple-500/30 text-emerald-300 font-mono text-xs overflow-x-auto custom-scrollbar leading-relaxed">
                  {lightboxArtifact.previewContent}
                </pre>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#140b2e] p-3 rounded-xl border border-purple-500/20">
              <div>
                <span className="text-slate-400 block text-[10px]">Uploaded At:</span>
                <span className="text-white">{lightboxArtifact.uploadedAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Uploaded By:</span>
                <span className="text-white">{lightboxArtifact.uploadedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Agent:</span>
                <span className="text-purple-300 font-bold">{lightboxArtifact.assignedAgent || 'ARCHON'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Extracted IOCs:</span>
                <span className="text-emerald-400 font-bold">{lightboxArtifact.extractedIOCsCount || 0} indicators</span>
              </div>
              {lightboxArtifact.sha256 && (
                <div className="col-span-2 pt-1 border-t border-purple-500/10">
                  <span className="text-slate-400 block text-[10px]">SHA-256 Hash:</span>
                  <span className="text-slate-300 font-mono text-[10px] break-all">{lightboxArtifact.sha256}</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLightboxArtifact(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
