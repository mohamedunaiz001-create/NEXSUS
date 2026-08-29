import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.NEXSUS_DATA_DIR?.trim() || path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'nexsus.sqlite');
export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY, title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    stage TEXT NOT NULL, summary TEXT NOT NULL, assigned_agent TEXT NOT NULL,
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    owner_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    jti TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL, revoked_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_cases_owner ON cases(owner_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
`);

export interface DbCase {
  id: string; title: string; severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'; stage: string;
  summary: string; assignedAgent: string; confidence: number; ownerId: string;
  createdAt: string; updatedAt: string;
}

function rowToCase(row: any): DbCase {
  return { id: row.id, title: row.title, severity: row.severity, stage: row.stage, summary: row.summary, assignedAgent: row.assigned_agent, confidence: row.confidence, ownerId: row.owner_id, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function getCase(id: string): DbCase | null {
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(id);
  return row ? rowToCase(row) : null;
}

export function upsertCase(input: Omit<DbCase, 'createdAt'|'updatedAt'>, createdAt?: string): DbCase {
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO cases (id,title,severity,stage,summary,assigned_agent,confidence,owner_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title,severity=excluded.severity,stage=excluded.stage,summary=excluded.summary,assigned_agent=excluded.assigned_agent,confidence=excluded.confidence,updated_at=excluded.updated_at`)
    .run(input.id,input.title,input.severity,input.stage,input.summary,input.assignedAgent,input.confidence,input.ownerId,createdAt||now,now);
  return getCase(input.id)!;
}

export function deleteCase(id: string): boolean {
  return Number(db.prepare('DELETE FROM cases WHERE id = ?').run(id).changes) > 0;
}

export function createSession(jti: string, userId: string, expiresAt: string): void {
  db.prepare('INSERT INTO sessions (jti,user_id,created_at,expires_at) VALUES (?,?,?,?)').run(jti,userId,new Date().toISOString(),expiresAt);
}

export function isSessionActive(jti: string): boolean {
  const row: any = db.prepare('SELECT expires_at, revoked_at FROM sessions WHERE jti = ?').get(jti);
  return !!row && !row.revoked_at && Date.parse(row.expires_at) > Date.now();
}

export function revokeSession(jti: string): void {
  db.prepare('UPDATE sessions SET revoked_at = ? WHERE jti = ? AND revoked_at IS NULL').run(new Date().toISOString(),jti);
}

export function revokeAllUserSessions(userId: string): void {
  db.prepare('UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL').run(new Date().toISOString(),userId);
}

export function pruneExpiredSessions(): void {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL').run(new Date().toISOString());
}
setInterval(pruneExpiredSessions, 60*60*1000).unref();
