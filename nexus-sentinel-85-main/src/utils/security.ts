import DOMPurify from 'dompurify';

/**
 * Escapes special HTML characters to prevent XSS in HTML report generation and template strings.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes rich HTML / Markdown strings using DOMPurify with strict cybersecurity tag rules.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'span', 'div', 'ul', 'ol', 'li', 
      'code', 'pre', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'img'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class', 'src', 'alt', 'id', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
}

/**
 * Validates whether an external URL is safe to open or embed.
 * Strictly forbids javascript:, data:, file:, vbscript:, and blob: schemes.
 */
export function isSafeUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();

  // Explicit forbidden scheme prefix test
  const dangerousSchemes = ['javascript:', 'data:', 'file:', 'vbscript:', 'blob:'];
  const lower = trimmed.toLowerCase();
  for (const scheme of dangerousSchemes) {
    if (lower.startsWith(scheme)) return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    // Relative URLs or malformed
    return false;
  }
}

/**
 * Strips secret API keys from providers before saving to localStorage or transmitting to public views.
 */
export function stripApiKeys<T>(data: T): T {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => stripApiKeys(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const copy: any = { ...data };
    if ('apiKey' in copy) {
      delete copy.apiKey;
    }
    for (const key of Object.keys(copy)) {
      if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = stripApiKeys(copy[key]);
      }
    }
    return copy;
  }

  return data;
}

/**
 * Client-side file safety validation for evidence upload.
 */
export function validateFileSafety(file: File): { isSafe: boolean; error?: string } {
  // Max size: 25MB
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { isSafe: false, error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 25 MB security limit.` };
  }

  const name = file.name.toLowerCase();
  // Block potentially dangerous web-executable extensions if mistakenly uploaded
  const forbiddenExts = ['.html', '.htm', '.xhtml', '.svg', '.php', '.phtml', '.jsp', '.asp', '.aspx', '.cgi'];
  for (const ext of forbiddenExts) {
    if (name.endsWith(ext)) {
      return { isSafe: false, error: `File extension '${ext}' is blocked for web security.` };
    }
  }

  return { isSafe: true };
}
