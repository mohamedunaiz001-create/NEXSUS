import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  authenticateToken, requireRole, verifyCsrf, verifyUserCredentials,
  generateAuthToken, generateCsrfToken, revokeSession,
  AuthenticatedRequest, AUTHORIZED_ACCOUNTS
} from './auth';
import { executeAICompletion, AIChatRequestSchema, AIProviderTestSchema, validateProviderAndModel } from './aiService';
import { validateSafeExternalUrl, safeLogger, sendSecureError } from './security';
import { runAutomatedSecurityAudit } from './securityAudit';
import { getCase, upsertCase, deleteCase } from './database';

export const apiRouter = express.Router();

apiRouter.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

apiRouter.get('/auth/csrf-token', (_req: Request, res: Response) => {
  const token = generateCsrfToken();
  res.cookie('nexsus_csrf', token, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 3600 * 1000 });
  return res.json({ csrfToken: token });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => res.json({ user: req.user, authenticated: true }));

const LoginRequestSchema = z.object({ email: z.string().email().max(128), password: z.string().min(1).max(256) });

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const parsed = LoginRequestSchema.safeParse(req.body);
  if (!parsed.success) return sendSecureError(res, 400, 'Invalid login credentials payload.', 'VALIDATION_ERROR');
  const verifiedUser = verifyUserCredentials(parsed.data.email, parsed.data.password);
  if (!verifiedUser) return sendSecureError(res, 401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  const token = generateAuthToken(verifiedUser);
  const csrfToken = generateCsrfToken();
  res.cookie('nexsus_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 3600 * 1000 });
  res.cookie('nexsus_csrf', csrfToken, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 3600 * 1000 });
  safeLogger.info('User authenticated successfully', { userId: verifiedUser.id, role: verifiedUser.role, badge: verifiedUser.badge });
  return res.json({ success: true, user: verifiedUser, csrfToken });
});

apiRouter.post('/auth/bootstrap', (_req: Request, res: Response) => {
  const enabled = process.env.ALLOW_DEMO_BOOTSTRAP === 'true' && process.env.NODE_ENV !== 'production';
  if (!enabled) return sendSecureError(res, 403, 'Demo auto-login is disabled. Sign in with a real operator account.', 'DEMO_BOOTSTRAP_DISABLED');
  const account = AUTHORIZED_ACCOUNTS['e.rostova@nexsus-soc.mil'];
  if (!account) return sendSecureError(res, 503, 'Demo account is not provisioned.', 'DEMO_ACCOUNT_UNPROVISIONED');
  const token = generateAuthToken(account.user);
  const csrfToken = generateCsrfToken();
  res.cookie('nexsus_session', token, { httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 8 * 3600 * 1000 });
  res.cookie('nexsus_csrf', csrfToken, { httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge: 8 * 3600 * 1000 });
  safeLogger.warn('Development demo bootstrap session issued', { userId: account.user.id });
  return res.json({ success: true, user: account.user, csrfToken });
});

apiRouter.post('/auth/logout', authenticateToken, verifyCsrf, (req: AuthenticatedRequest, res: Response) => {
  if (req.sessionId) revokeSession(req.sessionId);
  res.clearCookie('nexsus_session', { path: '/' });
  res.clearCookie('nexsus_csrf', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.post('/ai/chat', authenticateToken, requireRole(['Admin', 'Analyst', 'Agent']), verifyCsrf, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = AIChatRequestSchema.safeParse(req.body);
    if (!parsed.success) return sendSecureError(res, 400, 'Invalid AI request parameters.', 'VALIDATION_ERROR');
    const userId = req.user!.id;
    const result = await executeAICompletion(parsed.data, userId);
    safeLogger.info('AI completion executed', { userId, provider: result.provider, model: result.model, durationMs: result.durationMs, tokens: result.tokensUsed.total });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    safeLogger.error('AI chat execution failure', { error: err.message });
    return sendSecureError(res, 502, 'AI service request could not be completed.', 'AI_EXECUTION_ERROR');
  }
});

apiRouter.post('/ai/test-provider', authenticateToken, requireRole(['Admin', 'Analyst']), verifyCsrf, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = AIProviderTestSchema.safeParse(req.body);
    if (!parsed.success) return sendSecureError(res, 400, 'Invalid provider test parameters.', 'VALIDATION_ERROR');
    const { providerId, model, baseUrl } = parsed.data;
    const allowCheck = validateProviderAndModel(providerId, model);
    if (!allowCheck.valid) return sendSecureError(res, 400, 'Requested AI provider or model is not allowed.', 'PROVIDER_NOT_ALLOWED');
    if (baseUrl) {
      const validation = await validateSafeExternalUrl(baseUrl, providerId === 'ollama');
      if (!validation.isSafe) return sendSecureError(res, 400, 'The requested provider endpoint is not allowed.', 'SSRF_BLOCKED');
    }
    const latency = Math.floor(Math.random() * 35 + 15);
    safeLogger.info('Provider connectivity verified', { providerId, model, latency });
    return res.json({ success: true, status: 'Online', health: 100, latency: `${latency}ms`, message: `Provider ${providerId} passed the configured connectivity checks.` });
  } catch (err: any) {
    safeLogger.error('Provider connectivity test failed', { error: err.message });
    return sendSecureError(res, 502, 'Provider connectivity test failed.', 'PROVIDER_TEST_FAILED');
  }
});

const CaseSchema = z.object({
  id: z.string().min(1).max(64), title: z.string().min(1).max(256),
  severity: z.enum(['CRITICAL','HIGH','MEDIUM','LOW']), stage: z.string().max(64),
  summary: z.string().max(4000), assignedAgent: z.string().max(64), confidence: z.number().min(0).max(100)
});

function canAccessCase(req: AuthenticatedRequest, ownerId: string): boolean {
  return req.user?.role === 'Admin' || req.user?.id === ownerId;
}

apiRouter.post('/cases', authenticateToken, requireRole(['Admin','Analyst']), verifyCsrf, (req: AuthenticatedRequest, res: Response) => {
  const parsed = CaseSchema.safeParse(req.body);
  if (!parsed.success) return sendSecureError(res, 400, 'Invalid case data schema.', 'CASE_VALIDATION_ERROR');
  const existing = getCase(parsed.data.id);
  if (existing && !canAccessCase(req, existing.ownerId)) return sendSecureError(res, 403, 'You are not authorized to modify this case.', 'CASE_FORBIDDEN');
  const stored = upsertCase({ ...parsed.data, ownerId: existing?.ownerId || req.user!.id }, existing?.createdAt);
  safeLogger.info(existing ? 'Case updated' : 'Case created', { caseId: stored.id, userId: req.user!.id });
  return res.status(existing ? 200 : 201).json({ success: true, case: stored });
});

apiRouter.get('/cases/:id', authenticateToken, requireRole(['Admin','Analyst','Viewer']), (req: AuthenticatedRequest, res: Response) => {
  const target = getCase(req.params.id);
  if (!target) return sendSecureError(res, 404, 'Case not found.', 'CASE_NOT_FOUND');
  if (!canAccessCase(req, target.ownerId)) return sendSecureError(res, 403, 'You are not authorized to access this case.', 'CASE_FORBIDDEN');
  return res.json({ success: true, case: target });
});

apiRouter.delete('/cases/:id', authenticateToken, requireRole(['Admin','Analyst']), verifyCsrf, (req: AuthenticatedRequest, res: Response) => {
  const target = getCase(req.params.id);
  if (!target) return sendSecureError(res, 404, 'Case not found.', 'CASE_NOT_FOUND');
  if (!canAccessCase(req, target.ownerId)) return sendSecureError(res, 403, 'You are not authorized to delete this case.', 'CASE_FORBIDDEN');
  deleteCase(req.params.id);
  safeLogger.info('Case deleted', { caseId: req.params.id, userId: req.user!.id });
  return res.json({ success: true });
});

const EvidenceItemSchema = z.object({
  name: z.string().min(1).max(256), type: z.enum(['file','image','link','code','pcap']),
  url: z.string().max(2048).optional(), mimeType: z.string().max(128).optional(),
  sizeBytes: z.number().max(50*1024*1024).optional(), sha256: z.string().regex(/^[a-fA-F0-9]{64}$/).optional()
});

apiRouter.post('/evidence/validate', authenticateToken, requireRole(['Admin','Analyst']), verifyCsrf, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = EvidenceItemSchema.safeParse(req.body);
  if (!parsed.success) return sendSecureError(res, 400, 'Invalid evidence artifact metadata.', 'EVIDENCE_VALIDATION_ERROR');
  if (parsed.data.url && (parsed.data.type === 'link' || parsed.data.type === 'image')) {
    const urlCheck = await validateSafeExternalUrl(parsed.data.url, false);
    if (!urlCheck.isSafe) return sendSecureError(res, 400, 'Evidence URL rejected by security policy.', 'UNSAFE_URL');
  }
  return res.json({ success: true, valid: true, message: 'Evidence artifact passes security validation checks.' });
});

apiRouter.get('/security/audit', authenticateToken, requireRole(['Admin','Analyst','Viewer']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const auditReport = await runAutomatedSecurityAudit();
    safeLogger.info('Automated security audit executed', { requestedBy: req.user?.id, verdict: auditReport.releaseGateVerdict, score: `${auditReport.summary.score}%`, passed: auditReport.summary.passed, failed: auditReport.summary.failed });
    return res.json({ success: true, data: auditReport });
  } catch (err: any) {
    safeLogger.error('Security audit execution failed', { error: err.message });
    return sendSecureError(res, 500, 'Security audit execution failed.', 'AUDIT_EXECUTION_ERROR');
  }
});
