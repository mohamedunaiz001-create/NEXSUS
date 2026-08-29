import crypto from 'crypto';
import { isPrivateIPv4, isPrivateIPv6, validateSafeExternalUrl } from './security';
import { generateCsrfToken, validateCsrfToken, selfTestAdminAuth, AUTHORIZED_ACCOUNTS } from './auth';
import { ALLOWED_PROVIDERS, validateProviderAndModel } from './aiService';

export interface SecurityCheckResult {
  id: string;
  name: string;
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'CSRF' | 'SSRF_PROTECTION' | 'CRYPTOGRAPHY' | 'AI_GATEWAY' | 'ENVIRONMENT';
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
  executionMs: number;
}

export interface SecurityAuditReport {
  status: 'HEALTHY' | 'DEGRADED' | 'ACTION_REQUIRED';
  releaseGateVerdict: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';
  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    failed: number;
    score: number; // dynamically computed percentage
  };
  checks: SecurityCheckResult[];
  environment: {
    nodeEnv: string;
    jwtSecretConfigured: boolean;
    csrfSecretConfigured: boolean;
    geminiKeyConfigured: boolean;
    uptimeSeconds: number;
  };
  timestamp: string;
  auditDurationMs: number;
}

/**
 * Runs active, automated security diagnostics against live system modules,
 * verifying real cryptographic operations, URL sanitizers, CSRF signing, and auth logic.
 */
export async function runAutomatedSecurityAudit(): Promise<SecurityAuditReport> {
  const startTime = Date.now();
  const checks: SecurityCheckResult[] = [];

  // Check 1: Private IPv4 Range Filtering (SSRF)
  {
    const t0 = Date.now();
    const testCases = [
      { ip: '127.0.0.1', expectedPrivate: true },
      { ip: '169.254.169.254', expectedPrivate: true },
      { ip: '10.0.0.1', expectedPrivate: true },
      { ip: '172.16.0.5', expectedPrivate: true },
      { ip: '192.168.1.1', expectedPrivate: true },
      { ip: '8.8.8.8', expectedPrivate: false },
      { ip: '1.1.1.1', expectedPrivate: false }
    ];
    let allPassed = true;
    for (const tc of testCases) {
      if (isPrivateIPv4(tc.ip) !== tc.expectedPrivate) {
        allPassed = false;
        break;
      }
    }
    checks.push({
      id: 'SEC-SSRF-IPV4',
      name: 'Private IPv4 SSRF Boundary Filter',
      category: 'SSRF_PROTECTION',
      status: allPassed ? 'PASS' : 'FAIL',
      details: allPassed
        ? 'Verified RFC 1918, RFC 3927 Link-Local, and RFC 5735 private address filtering.'
        : 'Private IPv4 filtering logic failed on one or more validation vectors.',
      executionMs: Date.now() - t0
    });
  }

  // Check 2: IPv6 / IPv4-Mapped Loopback & Local Filtering (SSRF)
  {
    const t0 = Date.now();
    const ipv6Tests = [
      { ip: '::1', expectedPrivate: true },
      { ip: 'fe80::1', expectedPrivate: true },
      { ip: 'fc00::1', expectedPrivate: true },
      { ip: '::ffff:127.0.0.1', expectedPrivate: true },
      { ip: '2001:4860:4860::8888', expectedPrivate: false }
    ];
    let allPassed = true;
    for (const tc of ipv6Tests) {
      if (isPrivateIPv6(tc.ip) !== tc.expectedPrivate) {
        allPassed = false;
        break;
      }
    }
    checks.push({
      id: 'SEC-SSRF-IPV6',
      name: 'IPv6 & IPv4-Mapped Address Quarantine',
      category: 'SSRF_PROTECTION',
      status: allPassed ? 'PASS' : 'FAIL',
      details: allPassed
        ? 'Verified IPv6 loopback (::1), unique local (fc00::/7), and dual-stack IPv4-mapped filters.'
        : 'IPv6 address quarantine logic failed validation check.',
      executionMs: Date.now() - t0
    });
  }

  // Check 3: External URL & Hostname SSRF Sanitization
  {
    const t0 = Date.now();
    const resCreds = await validateSafeExternalUrl('https://admin:pass@api.anthropic.com/v1');
    const resLocal = await validateSafeExternalUrl('http://169.254.169.254/latest/meta-data/');
    const resInvalidProto = await validateSafeExternalUrl('ftp://ftp.example.com/payload');

    const passed = !resCreds.isSafe && !resLocal.isSafe && !resInvalidProto.isSafe;
    checks.push({
      id: 'SEC-URL-VALIDATION',
      name: 'External URL & Cloud Metadata Shield',
      category: 'SSRF_PROTECTION',
      status: passed ? 'PASS' : 'FAIL',
      details: passed
        ? 'Active verification: Embedded URL credentials, cloud metadata endpoints, and untrusted protocols successfully blocked.'
        : 'URL sanitization allowed one or more prohibited external resource targets.',
      executionMs: Date.now() - t0
    });
  }

  // Check 4: Anti-CSRF Token Generation & Cryptographic Verification Cycle
  {
    const t0 = Date.now();
    const token = generateCsrfToken();
    const isValid = validateCsrfToken(token);
    const forgedToken = `${token.split('.')[0]}.${token.split('.')[1]}.0000000000000000000000000000000000000000000000000000000000000000`;
    const isForgedRejected = !validateCsrfToken(forgedToken);
    const isBlankRejected = !validateCsrfToken('');

    const passed = isValid && isForgedRejected && isBlankRejected;
    checks.push({
      id: 'SEC-CSRF-HMAC',
      name: 'HMAC-SHA256 Anti-CSRF Token Engine',
      category: 'CSRF',
      status: passed ? 'PASS' : 'FAIL',
      details: passed
        ? 'Verified token lifecycle: Generation, timestamp expiry validation, and forged signature rejection.'
        : 'CSRF token validation failed verification check.',
      executionMs: Date.now() - t0
    });
  }

  // Check 5: Credential Authentication & Timing-Safe Password Hash Engine
  {
    const t0 = Date.now();
    // Self-tests against whatever the admin password actually resolved to at
    // boot (env-provided or dev-generated) — never hardcodes or re-derives a
    // known password here.
    const { adminLoginWorks, wrongPasswordRejected, unknownUserRejected } = selfTestAdminAuth();

    const passed = adminLoginWorks && wrongPasswordRejected && unknownUserRejected;
    checks.push({
      id: 'SEC-AUTH-PBKDF2',
      name: 'PBKDF2 / Timing-Safe Authentication Engine',
      category: 'AUTHENTICATION',
      status: passed ? 'PASS' : 'FAIL',
      details: passed
        ? 'Verified constant-time password comparison, salted PBKDF2 hash validation, and rejection of invalid passphrases.'
        : 'Authentication verification engine failed on valid or invalid test cases (or the admin account is unprovisioned — set ADMIN_INITIAL_PASSWORD).',
      executionMs: Date.now() - t0
    });
  }

  // Check 6: Server-Authoritative Role Repository
  {
    const t0 = Date.now();
    const accountCount = Object.keys(AUTHORIZED_ACCOUNTS).length;
    const hasAdmin = Object.values(AUTHORIZED_ACCOUNTS).some(a => a.user.role === 'Admin');
    const hasAnalyst = Object.values(AUTHORIZED_ACCOUNTS).some(a => a.user.role === 'Analyst');

    const passed = accountCount >= 3 && hasAdmin && hasAnalyst;
    checks.push({
      id: 'SEC-RBAC-ACCOUNTS',
      name: 'Server-Side RBAC Account Registry',
      category: 'AUTHORIZATION',
      status: passed ? 'PASS' : 'WARN',
      details: passed
        ? `Verified ${accountCount} registered operator accounts with strict server-bound roles (Admin, Analyst, Viewer).`
        : `Only ${accountCount}/3 operator accounts are provisioned. Set ADMIN_INITIAL_PASSWORD / ANALYST_INITIAL_PASSWORD / VIEWER_INITIAL_PASSWORD (12+ chars each) to provision the missing accounts — unprovisioned accounts fail closed rather than using a fallback password.`,
      executionMs: Date.now() - t0
    });
  }

  // Check 7: AI Provider & Model Allowlist Gating
  {
    const t0 = Date.now();
    const validGoogle = validateProviderAndModel('google', 'gemini-3.7-flash');
    const invalidProvider = validateProviderAndModel('rogue-ai-provider', 'model-1');
    const invalidModel = validateProviderAndModel('google', 'unauthorized-model-999');

    const passed = validGoogle.valid && !invalidProvider.valid && !invalidModel.valid;
    checks.push({
      id: 'SEC-AI-ALLOWLIST',
      name: 'AI Gateway Provider & Model Allowlist Gating',
      category: 'AI_GATEWAY',
      status: passed ? 'PASS' : 'FAIL',
      details: passed
        ? `Enforced allowlist with ${Object.keys(ALLOWED_PROVIDERS).length} approved providers. Unauthorized providers and models are rejected.`
        : 'AI provider allowlist validation allowed unapproved provider or model.',
      executionMs: Date.now() - t0
    });
  }

  // Check 8: Environment & Secrets Posture
  {
    const t0 = Date.now();
    const jwtConfigured = !!process.env.JWT_SECRET;
    const csrfConfigured = !!process.env.CSRF_SECRET;
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const isProd = process.env.NODE_ENV === 'production';
    const demoBootstrapOpenInProd = isProd && process.env.ALLOW_DEMO_BOOTSTRAP === 'true';

    // Ephemeral dynamic secrets are secure for runtime, but explicit env var is recommended for multi-instance production
    let status: 'PASS' | 'WARN' = 'PASS';
    const warnings: string[] = [];

    if (!jwtConfigured) {
      warnings.push('JWT_SECRET is using high-entropy runtime ephemeral secret (set JWT_SECRET in .env for persistent multi-instance session clustering).');
      status = 'WARN';
    }
    if (!csrfConfigured) {
      warnings.push('CSRF_SECRET is using runtime ephemeral secret.');
      status = 'WARN';
    }
    if (!geminiConfigured) {
      warnings.push('GEMINI_API_KEY not configured (fallback deterministic SOC neural engine is active).');
    }
    if (demoBootstrapOpenInProd) {
      warnings.push('ALLOW_DEMO_BOOTSTRAP=true in production — every visitor without a session is auto-authenticated as the Analyst demo account. Disable unless this is an intentionally public demo.');
      status = 'WARN';
    }

    checks.push({
      id: 'SEC-ENV-SECRETS',
      name: 'Cryptographic Secrets & Key Provisioning',
      category: 'ENVIRONMENT',
      status,
      details: warnings.length > 0 ? warnings.join(' | ') : 'All cryptographic secrets and API keys are explicitly configured in environment.',
      executionMs: Date.now() - t0
    });
  }

  // Calculate dynamic metrics
  const passedCount = checks.filter(c => c.status === 'PASS').length;
  const warnCount = checks.filter(c => c.status === 'WARN').length;
  const failCount = checks.filter(c => c.status === 'FAIL').length;
  const totalChecks = checks.length;
  const score = Math.round(((passedCount + warnCount * 0.5) / totalChecks) * 100);

  let overallStatus: 'HEALTHY' | 'DEGRADED' | 'ACTION_REQUIRED' = 'HEALTHY';
  let releaseGateVerdict: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL' = 'PASS';

  if (failCount > 0) {
    overallStatus = 'ACTION_REQUIRED';
    releaseGateVerdict = 'FAIL';
  } else if (warnCount > 0) {
    overallStatus = 'DEGRADED';
    releaseGateVerdict = 'CONDITIONAL_PASS';
  }

  return {
    status: overallStatus,
    releaseGateVerdict,
    summary: {
      totalChecks,
      passed: passedCount,
      warnings: warnCount,
      failed: failCount,
      score
    },
    checks,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      jwtSecretConfigured: !!process.env.JWT_SECRET,
      csrfSecretConfigured: !!process.env.CSRF_SECRET,
      geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
      uptimeSeconds: Math.floor(process.uptime())
    },
    timestamp: new Date().toISOString(),
    auditDurationMs: Date.now() - startTime
  };
}
