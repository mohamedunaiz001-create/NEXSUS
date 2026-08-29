import dns from 'dns';
import { promisify } from 'util';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const dnsLookup = promisify(dns.lookup);

/**
 * Checks whether an IPv4 address string falls into a private or reserved network range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private-Use)
  if (a === 10) return true;
  // 100.64.0.0/10 (Shared Address Space)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (Private-Use)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && parts[2] === 0) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && parts[2] === 2) return true;
  // 192.168.0.0/16 (Private-Use)
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && parts[2] === 100) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && parts[2] === 113) return true;
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks whether an IPv6 address string is private/loopback/reserved.
 */
export function isPrivateIPv6(ip: string): boolean {
  const cleanIp = ip.toLowerCase();
  
  if (cleanIp === '::1' || cleanIp === '::') return true;
  
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (cleanIp.startsWith('::ffff:')) {
    const ipv4 = cleanIp.replace('::ffff:', '');
    return isPrivateIPv4(ipv4);
  }

  // fc00::/7 (Unique local)
  if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd')) return true;
  // fe80::/10 (Link-local)
  if (cleanIp.startsWith('fe8') || cleanIp.startsWith('fe9') || cleanIp.startsWith('fea') || cleanIp.startsWith('feb')) return true;
  // ff00::/8 (Multicast)
  if (cleanIp.startsWith('ff')) return true;

  return false;
}

/**
 * Strict SSRF protection and URL validation.
 * Verifies protocol, credentials, hostnames, and performs DNS resolution to guarantee non-internal destinations.
 */
export async function validateSafeExternalUrl(rawUrl: string, allowLocalDev: boolean = false): Promise<{ isSafe: boolean; reason?: string; parsedUrl?: URL }> {
  try {
    const parsed = new URL(rawUrl);

    // 1. Strict Protocol Check
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { isSafe: false, reason: `Unallowed protocol: ${parsed.protocol}. Only HTTPS (and restricted HTTP) is supported.` };
    }

    // 2. Disallow credentials embedded in URL (e.g., http://user:pass@host)
    if (parsed.username || parsed.password) {
      return { isSafe: false, reason: 'Credentials in URL are strictly prohibited.' };
    }

    // 3. Port restrictions
    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    const allowedPorts = [80, 443, 8000, 8080, 8443, 11434];
    if (!allowedPorts.includes(port)) {
      return { isSafe: false, reason: `Destination port ${port} is outside the allowed list (${allowedPorts.join(', ')}).` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 4. Block explicit loopback/metadata hostnames
    const blockedHostnames = ['localhost', 'metadata.google.internal', 'instance-data', '169.254.169.254'];
    if (!allowLocalDev && (blockedHostnames.includes(hostname) || hostname.endsWith('.internal') || hostname.endsWith('.local'))) {
      return { isSafe: false, reason: `Access to internal hostname '${hostname}' is blocked.` };
    }

    // 5. DNS Resolution and IP Address Validation
    try {
      const addresses = await dnsLookup(hostname, { all: true });
      if (!addresses || addresses.length === 0) {
        return { isSafe: false, reason: `DNS lookup failed for hostname '${hostname}'.` };
      }

      for (const entry of addresses) {
        if (entry.family === 4) {
          if (isPrivateIPv4(entry.address)) {
            if (!allowLocalDev || !entry.address.startsWith('127.')) {
              return { isSafe: false, reason: `Hostname '${hostname}' resolves to private IP: ${entry.address}. SSRF blocked.` };
            }
          }
        } else if (entry.family === 6) {
          if (isPrivateIPv6(entry.address)) {
            if (!allowLocalDev || entry.address !== '::1') {
              return { isSafe: false, reason: `Hostname '${hostname}' resolves to private IPv6: ${entry.address}. SSRF blocked.` };
            }
          }
        }
      }
    } catch (dnsErr: any) {
      return { isSafe: false, reason: `DNS resolution error: ${dnsErr.message || 'Unknown resolution failure'}` };
    }

    return { isSafe: true, parsedUrl: parsed };
  } catch (err: any) {
    return { isSafe: false, reason: `Malformed URL structure: ${err.message}` };
  }
}

/**
 * Sanitizes logs to prevent accidental leakage of API keys, Authorization headers, and secrets.
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['apikey', 'api_key', 'authorization', 'token', 'secret', 'password', 'cookie', 'set-cookie'];
  
  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      clean[key] = '[REDACTED_SECRET]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeLogData(value);
    } else if (typeof value === 'string' && value.length > 500) {
      clean[key] = `${value.slice(0, 100)}... [TRUNCATED ${value.length} BYTES]`;
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Safe logger that automatically redacts sensitive data and formats structured JSON logs with correlation IDs.
 */
export const safeLogger = {
  info: (msg: string, meta: Record<string, any> = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, JSON.stringify(sanitizeLogData(meta)));
  },
  warn: (msg: string, meta: Record<string, any> = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, JSON.stringify(sanitizeLogData(meta)));
  },
  error: (msg: string, meta: Record<string, any> = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, JSON.stringify(sanitizeLogData(meta)));
  }
};

/**
 * Formats a secure, production-ready error response that never leaks stack traces or internal filesystem paths.
 */
export function sendSecureError(res: Response, statusCode: number, message: string, code: string = 'SECURITY_ERROR', meta: Record<string, any> = {}) {
  const requestId = crypto.randomUUID();
  safeLogger.error(`Error response sent: ${code} - ${message}`, { requestId, statusCode, code, ...meta });
  
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
    requestId,
    timestamp: new Date().toISOString()
  });
}
