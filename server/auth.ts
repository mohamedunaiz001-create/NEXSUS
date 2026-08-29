import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { safeLogger, sendSecureError } from './security';

const isProduction = process.env.NODE_ENV === 'production';

// Generate dynamic cryptographic secrets at runtime if not provided in environment
// NEVER use static hardcoded fallback strings that can be extracted from source code!
const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  const generated = crypto.randomBytes(64).toString('hex');
  safeLogger.info('Generated ephemeral high-entropy JWT_SECRET for server runtime.');
  return generated;
})();

const CSRF_SECRET: string = process.env.CSRF_SECRET || (() => {
  const generated = crypto.randomBytes(64).toString('hex');
  safeLogger.info('Generated ephemeral high-entropy CSRF_SECRET for server runtime.');
  return generated;
})();

export type UserRole = 'Admin' | 'Analyst' | 'Viewer' | 'Agent';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badge: string;
  clearance: 'TOP_SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
  requestId?: string;
  csrfToken?: string;
}

interface StoredAccount {
  user: UserPayload;
  salt: string;
  passwordHash: string;
}

/**
 * Derives a secure password hash using PBKDF2 with HMAC-SHA512.
 */
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * Resolves the initial passphrase for a seeded operator account WITHOUT ever
 * hardcoding a real working password in source control.
 *
 * - If the operator has set the corresponding env var, that value is used.
 * - Otherwise, in non-production environments only, a random high-entropy
 *   password is generated fresh on every boot and printed once to the local
 *   server console (never returned by any API, never logged via safeLogger/
 *   structured logs) so a developer can still log in locally.
 * - In production with no env var set, the account is intentionally left
 *   unprovisioned (see buildAuthorizedAccounts) rather than shipping with a
 *   guessable or previously-published default password.
 */
function resolveInitialPassword(envValue: string | undefined, envVarName: string): string | null {
  if (envValue && envValue.trim().length >= 12) {
    return envValue;
  }

  if (envValue && envValue.trim().length > 0) {
    safeLogger.warn(`${envVarName} is set but shorter than the required 12 characters — ignoring it.`);
  }

  if (isProduction) {
    return null;
  }

  const generated = crypto.randomBytes(18).toString('base64url');
  // Intentionally uses console.log directly (bypassing safeLogger/structured
  // logs) so this one-time dev credential never ends up in aggregated log
  // storage — it is only ever visible in the local terminal that booted it.
  console.log(
    `\n[DEV ONLY] ${envVarName} is not set. Generated a temporary local login password:\n` +
      `  ${generated}\n` +
      `Set ${envVarName} in your environment for a stable password across restarts.\n`,
  );
  return generated;
}

// Generate secure fixed salts for initial authorized accounts
const SALT_ADMIN = crypto.randomBytes(16).toString('hex');
const SALT_ANALYST = crypto.randomBytes(16).toString('hex');
const SALT_VIEWER = crypto.randomBytes(16).toString('hex');

const PASS_ADMIN = resolveInitialPassword(process.env.ADMIN_INITIAL_PASSWORD, 'ADMIN_INITIAL_PASSWORD');
const PASS_ANALYST = resolveInitialPassword(process.env.ANALYST_INITIAL_PASSWORD, 'ANALYST_INITIAL_PASSWORD');
const PASS_VIEWER = resolveInitialPassword(process.env.VIEWER_INITIAL_PASSWORD, 'VIEWER_INITIAL_PASSWORD');

function buildAccount(
  password: string | null,
  salt: string,
  user: UserPayload,
): StoredAccount | null {
  if (!password) {
    safeLogger.warn(`Account '${user.email}' left unprovisioned — no password configured for production.`, {
      role: user.role,
    });
    return null;
  }
  return { user, salt, passwordHash: hashPassword(password, salt) };
}

// Server-authoritative credentials repository with fixed server-defined roles.
// In production, any account whose *_INITIAL_PASSWORD env var was never set
// is simply absent here (see buildAccount) — it fails closed instead of
// falling back to a password that once shipped in source control.
export const AUTHORIZED_ACCOUNTS: Record<string, StoredAccount> = Object.fromEntries(
  (
    [
      buildAccount(PASS_ADMIN, SALT_ADMIN, {
        id: 'usr-admin-01',
        name: 'Commander Marcus Vance',
        email: 'm.vance@nexsus-soc.mil',
        role: 'Admin',
        badge: 'CHIEF OF SOC',
        clearance: 'TOP_SECRET',
      }),
      buildAccount(PASS_ANALYST, SALT_ANALYST, {
        id: 'usr-analyst-02',
        name: 'Specialist Elena Rostova',
        email: 'e.rostova@nexsus-soc.mil',
        role: 'Analyst',
        badge: 'SENIOR IR ANALYST',
        clearance: 'SECRET',
      }),
      buildAccount(PASS_VIEWER, SALT_VIEWER, {
        id: 'usr-viewer-03',
        name: 'Auditor David Chen',
        email: 'd.chen@compliance-audit.org',
        role: 'Viewer',
        badge: 'COMPLIANCE AUDITOR',
        clearance: 'CONFIDENTIAL',
      }),
    ] as (StoredAccount | null)[]
  )
    .filter((account): account is StoredAccount => account !== null)
    .map((account) => [account.user.email, account]),
);

/**
 * Runs an in-process authentication self-test using the *actual* resolved
 * admin credentials (whatever they ended up being — env-provided or
 * dev-generated). Used only by the automated security audit endpoint; the
 * plaintext password never leaves this module or gets returned by any API.
 */
export function selfTestAdminAuth(): { adminLoginWorks: boolean; wrongPasswordRejected: boolean; unknownUserRejected: boolean } {
  if (!PASS_ADMIN) {
    return { adminLoginWorks: false, wrongPasswordRejected: true, unknownUserRejected: true };
  }
  const adminUser = verifyUserCredentials('m.vance@nexsus-soc.mil', PASS_ADMIN);
  const badPass = verifyUserCredentials('m.vance@nexsus-soc.mil', 'WrongPassword!123');
  const unknownUser = verifyUserCredentials('nonexistent@domain.com', 'SomePassword!123');
  return {
    adminLoginWorks: adminUser !== null && adminUser.role === 'Admin',
    wrongPasswordRejected: badPass === null,
    unknownUserRejected: unknownUser === null,
  };
}

/**
 * Constant-time credential verification.
 * Prevents timing attacks during authentication.
 */
export function verifyUserCredentials(email: string, passwordAttempt: string): UserPayload | null {
  const normalizedEmail = email.toLowerCase().trim();
  const account = AUTHORIZED_ACCOUNTS[normalizedEmail];
  
  if (!account) {
    // Perform dummy hash comparison to prevent timing-based user enumeration
    const dummySalt = '00000000000000000000000000000000';
    const dummyHash = hashPassword('dummy_pass', dummySalt);
    const dummyAttempt = hashPassword(passwordAttempt, dummySalt);
    crypto.timingSafeEqual(Buffer.from(dummyHash, 'hex'), Buffer.from(dummyAttempt, 'hex'));
    return null;
  }

  const attemptHash = hashPassword(passwordAttempt, account.salt);
  const hashBuffer = Buffer.from(account.passwordHash, 'hex');
  const attemptBuffer = Buffer.from(attemptHash, 'hex');

  if (hashBuffer.length !== attemptBuffer.length) {
    return null;
  }

  const isMatch = crypto.timingSafeEqual(hashBuffer, attemptBuffer);
  return isMatch ? account.user : null;
}

/**
 * Generates a signed JWT session token for a validated user payload.
 */
export function generateAuthToken(user: UserPayload): string {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      badge: user.badge,
      clearance: user.clearance
    },
    JWT_SECRET,
    { expiresIn: '8h', algorithm: 'HS256' }
  );
}

/**
 * Generates a cryptographically signed anti-CSRF token using HMAC-SHA256.
 */
export function generateCsrfToken(): string {
  const randomValue = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${randomValue}:${timestamp}`)
    .digest('hex');
  return `${randomValue}.${timestamp}.${signature}`;
}

/**
 * Validates a signed anti-CSRF token.
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [randomValue, timestamp, signature] = parts;
  const timeNum = parseInt(timestamp, 10);
  if (isNaN(timeNum)) return false;

  // Enforce max age of 8 hours
  if (Date.now() - timeNum > 8 * 3600 * 1000) return false;

  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${randomValue}:${timestamp}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'hex');
  const actualBuf = Buffer.from(signature, 'hex');

  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Authentication Middleware:
 * Strictly requires a valid JWT in Bearer header or HTTP-only session cookie.
 * NEVER falls back to an unauthenticated demo role.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (!token && req.cookies?.['nexsus_session']) {
    token = req.cookies['nexsus_session'];
  }

  if (!token) {
    return sendSecureError(
      res,
      401,
      'Authentication required. No valid session or authorization token provided.',
      'AUTH_REQUIRED'
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    
    if (!decoded || !decoded.sub || !decoded.role) {
      return sendSecureError(res, 401, 'Invalid session payload structure.', 'INVALID_TOKEN_PAYLOAD');
    }

    req.user = {
      id: decoded.sub,
      name: decoded.name || 'Unknown Operator',
      email: decoded.email || '',
      role: decoded.role as UserRole,
      badge: decoded.badge || 'SOC OPERATOR',
      clearance: decoded.clearance || 'CONFIDENTIAL'
    };

    next();
  } catch (err: any) {
    safeLogger.warn('JWT verification failed', { error: err.message });
    return sendSecureError(
      res,
      401,
      err.name === 'TokenExpiredError' ? 'Session token has expired. Please log in again.' : 'Invalid session token signature.',
      err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    );
  }
}

/**
 * Role-Based Authorization Middleware:
 * Enforces server-side user role requirements.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendSecureError(res, 401, 'Authentication required before verifying role authorization.', 'UNAUTHENTICATED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      safeLogger.warn('Access denied: insufficient privileges', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl
      });
      return sendSecureError(
        res,
        403,
        `Access denied. Role '${req.user.role}' lacks required permissions [${allowedRoles.join(', ')}].`,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
}

/**
 * CSRF Protection Middleware:
 * Enforces valid anti-CSRF token verification for state-changing HTTP requests.
 */
export function verifyCsrf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Safe HTTP methods do not require CSRF token
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Allow login and csrf-token bootstrap endpoints without CSRF token
  if (req.path === '/api/auth/login' || req.path === '/api/auth/csrf-token' || req.path === '/api/auth/bootstrap') {
    return next();
  }

  const clientCsrfHeader = req.headers['x-csrf-token'] as string;
  const cookieCsrfToken = req.cookies?.['nexsus_csrf'];

  const tokenToVerify = clientCsrfHeader || cookieCsrfToken;

  if (!tokenToVerify || !validateCsrfToken(tokenToVerify)) {
    safeLogger.warn('CSRF verification failed', {
      method: req.method,
      path: req.path,
      hasHeader: !!clientCsrfHeader,
      hasCookie: !!cookieCsrfToken
    });
    return sendSecureError(
      res,
      403,
      'CSRF token validation failed. State-changing requests require a valid X-CSRF-Token.',
      'CSRF_INVALID'
    );
  }

  next();
}
