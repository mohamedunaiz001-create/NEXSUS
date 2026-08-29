import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { safeLogger, sendSecureError } from './security';

const isProduction = process.env.NODE_ENV === 'production';

function requireSecret(name: 'JWT_SECRET' | 'CSRF_SECRET'): string {
  const value = process.env[name]?.trim();
  if (value && value.length >= 64) return value;
  if (isProduction) throw new Error(`${name} environment variable is required and must be at least 64 characters in production.`);
  const generated = crypto.randomBytes(64).toString('hex');
  safeLogger.warn(`${name} not configured; generated ephemeral development secret. Set ${name} for stable local sessions.`);
  return generated;
}

const JWT_SECRET = requireSecret('JWT_SECRET');
const CSRF_SECRET = requireSecret('CSRF_SECRET');

export type UserRole = 'Admin' | 'Analyst' | 'Viewer' | 'Agent';
export interface UserPayload { id: string; name: string; email: string; role: UserRole; badge: string; clearance: 'TOP_SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'RESTRICTED'; }
export interface AuthenticatedRequest extends Request { user?: UserPayload; requestId?: string; csrfToken?: string; }
interface StoredAccount { user: UserPayload; salt: string; passwordHash: string; }

function hashPassword(password: string, salt: string): string { return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex'); }
function resolveInitialPassword(envValue: string | undefined, envVarName: string): string | null {
  if (envValue && envValue.trim().length >= 12) return envValue;
  if (envValue && envValue.trim().length > 0) safeLogger.warn(`${envVarName} is set but shorter than the required 12 characters — ignoring it.`);
  if (isProduction) return null;
  const generated = crypto.randomBytes(18).toString('base64url');
  console.log(`\n[DEV ONLY] ${envVarName} is not set. Generated a temporary local login password:\n  ${generated}\nSet ${envVarName} in your environment for a stable password across restarts.\n`);
  return generated;
}

const SALT_ADMIN = crypto.randomBytes(16).toString('hex');
const SALT_ANALYST = crypto.randomBytes(16).toString('hex');
const SALT_VIEWER = crypto.randomBytes(16).toString('hex');
const PASS_ADMIN = resolveInitialPassword(process.env.ADMIN_INITIAL_PASSWORD, 'ADMIN_INITIAL_PASSWORD');
const PASS_ANALYST = resolveInitialPassword(process.env.ANALYST_INITIAL_PASSWORD, 'ANALYST_INITIAL_PASSWORD');
const PASS_VIEWER = resolveInitialPassword(process.env.VIEWER_INITIAL_PASSWORD, 'VIEWER_INITIAL_PASSWORD');
function buildAccount(password: string | null, salt: string, user: UserPayload): StoredAccount | null {
  if (!password) { safeLogger.warn(`Account '${user.email}' left unprovisioned — no password configured for production.`, { role: user.role }); return null; }
  return { user, salt, passwordHash: hashPassword(password, salt) };
}
export const AUTHORIZED_ACCOUNTS: Record<string, StoredAccount> = Object.fromEntries(([
  buildAccount(PASS_ADMIN, SALT_ADMIN, { id:'usr-admin-01', name:'Commander Marcus Vance', email:'m.vance@nexsus-soc.mil', role:'Admin', badge:'CHIEF OF SOC', clearance:'TOP_SECRET' }),
  buildAccount(PASS_ANALYST, SALT_ANALYST, { id:'usr-analyst-02', name:'Specialist Elena Rostova', email:'e.rostova@nexsus-soc.mil', role:'Analyst', badge:'SENIOR IR ANALYST', clearance:'SECRET' }),
  buildAccount(PASS_VIEWER, SALT_VIEWER, { id:'usr-viewer-03', name:'Auditor David Chen', email:'d.chen@compliance-audit.org', role:'Viewer', badge:'COMPLIANCE AUDITOR', clearance:'CONFIDENTIAL' })
] as (StoredAccount | null)[]).filter((account): account is StoredAccount => account !== null).map(account => [account.user.email, account]));

export function selfTestAdminAuth() { if (!PASS_ADMIN) return { adminLoginWorks:false, wrongPasswordRejected:true, unknownUserRejected:true }; const adminUser=verifyUserCredentials('m.vance@nexsus-soc.mil',PASS_ADMIN); const badPass=verifyUserCredentials('m.vance@nexsus-soc.mil','WrongPassword!123'); const unknownUser=verifyUserCredentials('nonexistent@domain.com','SomePassword!123'); return { adminLoginWorks:!!adminUser&&adminUser.role==='Admin', wrongPasswordRejected:badPass===null, unknownUserRejected:unknownUser===null }; }
export function verifyUserCredentials(email: string, passwordAttempt: string): UserPayload | null {
  const account = AUTHORIZED_ACCOUNTS[email.toLowerCase().trim()];
  if (!account) { const salt='00000000000000000000000000000000'; const a=hashPassword('dummy_pass',salt); const b=hashPassword(passwordAttempt,salt); crypto.timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex')); return null; }
  const attempt=Buffer.from(hashPassword(passwordAttempt,account.salt),'hex'); const expected=Buffer.from(account.passwordHash,'hex');
  if (attempt.length!==expected.length) return null; return crypto.timingSafeEqual(expected,attempt) ? account.user : null;
}
export function generateAuthToken(user: UserPayload): string { return jwt.sign({sub:user.id,name:user.name,email:user.email,role:user.role,badge:user.badge,clearance:user.clearance},JWT_SECRET,{expiresIn:'8h',algorithm:'HS256'}); }
export function generateCsrfToken(): string { const randomValue=crypto.randomBytes(32).toString('hex'); const timestamp=Date.now().toString(); const signature=crypto.createHmac('sha256',CSRF_SECRET).update(`${randomValue}:${timestamp}`).digest('hex'); return `${randomValue}.${timestamp}.${signature}`; }
export function validateCsrfToken(token: string): boolean {
  if (!token || typeof token!=='string') return false; const parts=token.split('.'); if(parts.length!==3)return false; const [randomValue,timestamp,signature]=parts; const timeNum=Number(timestamp); if(!Number.isSafeInteger(timeNum))return false; const age=Date.now()-timeNum; if(age<0 || age>8*3600*1000)return false; if(!/^[a-f0-9]{64}$/i.test(randomValue)||!/^[a-f0-9]{64}$/i.test(signature))return false;
  const expected=crypto.createHmac('sha256',CSRF_SECRET).update(`${randomValue}:${timestamp}`).digest('hex'); const eb=Buffer.from(expected,'hex'); const ab=Buffer.from(signature,'hex'); return eb.length===ab.length&&crypto.timingSafeEqual(eb,ab);
}
export function authenticateToken(req: AuthenticatedRequest,res: Response,next: NextFunction) {
  const authHeader=req.headers.authorization; let token=authHeader?.startsWith('Bearer ')?authHeader.substring(7).trim():null; if(!token) token=req.cookies?.nexsus_session;
  if(!token)return sendSecureError(res,401,'Authentication required. No valid session or authorization token provided.','AUTH_REQUIRED');
  try { const decoded=jwt.verify(token,JWT_SECRET,{algorithms:['HS256']}) as any; if(!decoded?.sub||!decoded?.role)return sendSecureError(res,401,'Invalid session payload structure.','INVALID_TOKEN_PAYLOAD'); req.user={id:decoded.sub,name:decoded.name||'Unknown Operator',email:decoded.email||'',role:decoded.role as UserRole,badge:decoded.badge||'SOC OPERATOR',clearance:decoded.clearance||'CONFIDENTIAL'}; return next(); }
  catch(err:any){ safeLogger.warn('JWT verification failed',{error:err.message}); return sendSecureError(res,401,err.name==='TokenExpiredError'?'Session token has expired. Please log in again.':'Invalid session token signature.',err.name==='TokenExpiredError'?'TOKEN_EXPIRED':'TOKEN_INVALID'); }
}
export function requireRole(allowedRoles: UserRole[]) { return (req: AuthenticatedRequest,res: Response,next: NextFunction)=>{ if(!req.user)return sendSecureError(res,401,'Authentication required before verifying role authorization.','UNAUTHENTICATED'); if(!allowedRoles.includes(req.user.role)){safeLogger.warn('Access denied: insufficient privileges',{userId:req.user.id,userRole:req.user.role,requiredRoles:allowedRoles,path:req.originalUrl});return sendSecureError(res,403,`Access denied. Role '${req.user.role}' lacks required permissions.`,'FORBIDDEN_ROLE');} return next();}; }
export function verifyCsrf(req: AuthenticatedRequest,res: Response,next: NextFunction) {
  if(['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  if(req.path==='/api/auth/login'||req.path==='/api/auth/csrf-token'||req.path==='/api/auth/bootstrap') return next();
  const header=req.headers['x-csrf-token']; const cookie=req.cookies?.nexsus_csrf;
  if(typeof header!=='string'||!header||typeof cookie!=='string'||!cookie||header!==cookie||!validateCsrfToken(header)) return sendSecureError(res,403,'CSRF token validation failed. State-changing requests require a matching valid X-CSRF-Token header and CSRF cookie.','CSRF_INVALID');
  return next();
}
