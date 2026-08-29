import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { safeLogger, sendSecureError } from './security';

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

// Generate secure fixed salts for initial authorized accounts
const SALT_ADMIN = crypto.randomBytes(16).toString('hex');
const SALT_ANALYST = crypto.randomBytes(16).toString('hex');
const SALT_VIEWER = crypto.randomBytes(16).toString('hex');

// Default initial passphrases for standard SOC operators
const PASS_ADMIN = process.env.ADMIN_INITIAL_PASSWORD || 'Vance#ChiefSOC!2026';
const PASS_ANALYST = process.env.ANALYST_INITIAL_PASSWORD || 'Rostova#AnalystIR!2026';
const PASS_VIEWER = process.env.VIEWER_INITIAL_PASSWORD || 'Chen#AuditSOC!2026';

// Server-authoritative credentials repository with fixed server-defined roles
export const AUTHORIZED_ACCOUNTS: Record<string, StoredAccount> = {
  'm.vance@nexsus-soc.mil': {
    user: {
      id: 'usr-admin-01',
      name: 'Commander Marcus Vance',
      email: 'm.vance@nexsus-soc.mil',
      role: 'Admin',
      badge: 'CHIEF OF SOC',
      clearance: 'TOP_SECRET'
    },
    salt: SALT_ADMIN,
    passwordHash: hashPassword(PASS_ADMIN, SALT_ADMIN)
  },
  'e.rostova@nexsus-soc.mil': {
    user: {
      id: 'usr-analyst-02',
      name: 'Specialist Elena Rostova',
      email: 'e.rostova@nexsus-soc.mil',
      role: 'Analyst',
      badge: 'SENIOR IR ANALYST',
      clearance: 'SECRET'
    },
    salt: SALT_ANALYST,
    passwordHash: hashPassword(PASS_ANALYST, SALT_ANALYST)
  },
  'd.chen@compliance-audit.org': {
    user: {
      id: 'usr-viewer-03',
      name: 'Auditor David Chen',
      email: 'd.chen@compliance-audit.org',
      role: 'Viewer',
      badge: 'COMPLIANCE AUDITOR',
      clearance: 'CONFIDENTIAL'
    },
    salt: SALT_VIEWER,
    passwordHash: hashPassword(PASS_VIEWER, SALT_VIEWER)
  }
};

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
