import * as fs from 'fs';
import * as path from 'path';
import { Database } from 'bun:sqlite';
import { z } from 'zod';

function getDataDir(): string {
  // Explicit override always wins (useful for tests, CI, or per-shell isolation).
  const override = process.env.CLOCKTOPUS_DATA_DIR;
  if (override && override.trim()) return path.resolve(override);

  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const isDev = scriptDir.includes('/Projects/') || scriptDir.includes('/src/');
  if (isDev) {
    // Anchor to the repo (scriptDir is <repo>/dist/lib), NOT process.cwd().
    // Otherwise the git post-checkout hook, which runs in the target project's
    // cwd, would spawn a stray data/ directory there.
    return path.resolve(scriptDir, '..', '..', 'data', 'db');
  }
  return path.join(process.env.HOME || '~', '.clocktopus', 'data');
}

const DB_DIR = getDataDir();
const DB_PATH = path.join(DB_DIR, 'sessions.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const SessionSchema = z.object({
  id: z.string(),
  projectId: z.string().nullable(),
  description: z.string(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  isAutoCompleted: z.number(),
  jiraTicket: z.string().nullable(),
  jiraWorklogId: z.string().nullable().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

let dbInstance: Database | null = null;

function getDb(): Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.exec('PRAGMA journal_mode = WAL');
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        projectId TEXT,
        description TEXT NOT NULL,
        startedAt TEXT NOT NULL,
        completedAt TEXT,
        isAutoCompleted INTEGER DEFAULT 0,
        jiraTicket TEXT,
        jiraWorklogId TEXT
      )
    `);
    // Migration: add jiraWorklogId to pre-existing sessions tables
    const sessionCols = dbInstance.prepare('PRAGMA table_info(sessions)').all() as Array<{ name: string }>;
    if (!sessionCols.some((c) => c.name === 'jiraWorklogId')) {
      dbInstance.exec('ALTER TABLE sessions ADD COLUMN jiraWorklogId TEXT');
    }
    // Migration: drop NOT NULL on sessions.projectId if it was created with the old schema
    const projectIdCol = (sessionCols as Array<{ name: string; notnull: number }>).find((c) => c.name === 'projectId');
    if (projectIdCol && projectIdCol.notnull === 1) {
      dbInstance.exec('BEGIN');
      try {
        dbInstance.exec(`
          CREATE TABLE sessions_new (
            id TEXT PRIMARY KEY,
            projectId TEXT,
            description TEXT NOT NULL,
            startedAt TEXT NOT NULL,
            completedAt TEXT,
            isAutoCompleted INTEGER DEFAULT 0,
            jiraTicket TEXT,
            jiraWorklogId TEXT
          )
        `);
        dbInstance.exec(
          'INSERT INTO sessions_new (id, projectId, description, startedAt, completedAt, isAutoCompleted, jiraTicket, jiraWorklogId) ' +
            'SELECT id, projectId, description, startedAt, completedAt, isAutoCompleted, jiraTicket, jiraWorklogId FROM sessions',
        );
        dbInstance.exec('DROP TABLE sessions');
        dbInstance.exec('ALTER TABLE sessions_new RENAME TO sessions');
        dbInstance.exec('COMMIT');
      } catch (err) {
        dbInstance.exec('ROLLBACK');
        throw err;
      }
    }
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS google_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS event_projects (
        eventName TEXT PRIMARY KEY,
        projectId TEXT
      )
    `);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS credentials (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        active INTEGER DEFAULT 1
      )
    `);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS atlassian_tokens (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        cloud_id TEXT NOT NULL,
        site_url TEXT,
        createdAt TEXT NOT NULL
      )
    `);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  return dbInstance;
}

export function getEventProject(eventName: string): string | null | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT projectId FROM event_projects WHERE eventName = ?');
  const row = stmt.get(eventName) as { projectId: string | null } | undefined;

  return row ? row.projectId : undefined;
}

export function setEventProject(eventName: string, projectId: string | null) {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO event_projects (eventName, projectId) VALUES (?, ?)');
  stmt.run(eventName, projectId);
}

export function storeToken(token: object) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO google_tokens (token, createdAt) VALUES (?, ?)');
  stmt.run(JSON.stringify(token), new Date().toISOString());
}

export function getLatestToken() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM google_tokens ORDER BY createdAt DESC LIMIT 1');
  const row = stmt.get() as { token: string } | undefined;
  return row ? JSON.parse(row.token) : null;
}

export function logSessionStart(
  id: string,
  projectId: string | null,
  description: string,
  startedAt: string,
  jiraTicket?: string,
) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO sessions (id, projectId, description, startedAt, isAutoCompleted, jiraTicket) VALUES (?, ?, ?, ?, ?, ?)',
  );

  stmt.run(id, projectId ?? null, description, startedAt, 0, jiraTicket ?? null);
}

export function logCompletedSession(
  id: string,
  projectId: string | null,
  description: string,
  startedAt: string,
  completedAt: string,
  jiraTicket?: string,
) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO sessions (id, projectId, description, startedAt, completedAt, isAutoCompleted, jiraTicket) VALUES (?, ?, ?, ?, ?, 0, ?)',
  );
  stmt.run(id, projectId ?? null, description, startedAt, completedAt, jiraTicket ?? null);
}

export function completeLatestSession(completedAt: string, isAutoCompleted = false) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE sessions
    SET completedAt = ?, isAutoCompleted = ?
    WHERE id = (
      SELECT id FROM sessions WHERE completedAt IS NULL ORDER BY startedAt DESC LIMIT 1
    )
  `);

  stmt.run(completedAt, isAutoCompleted ? 1 : 0);
}

export function setSessionJiraWorklogId(sessionId: string, worklogId: string) {
  const db = getDb();
  db.prepare('UPDATE sessions SET jiraWorklogId = ? WHERE id = ?').run(worklogId, sessionId);
}

export function getSessionById(id: string): Session | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!row) return null;
  return SessionSchema.parse(row);
}

export function deleteSessionById(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function getRecentSessions(limit = 10, offset = 0) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM sessions ORDER BY startedAt DESC LIMIT ? OFFSET ?');
  return stmt.all(limit, offset);
}

export function getSessionsInRange(fromIso: string, toIso: string) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT * FROM sessions WHERE startedAt < ? AND (completedAt IS NULL OR completedAt > ?) ORDER BY startedAt ASC',
  );
  return stmt.all(toIso, fromIso);
}

export function getSessionCount() {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM sessions');
  const row = stmt.get() as { count: number };
  return row.count;
}

export function getOpenSession() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM sessions WHERE completedAt IS NULL ORDER BY startedAt DESC LIMIT 1');
  const row = stmt.get();
  if (!row) return null;
  return SessionSchema.parse(row);
}

export function getLatestSession() {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM sessions ORDER BY startedAt DESC LIMIT 1
  `);

  return SessionSchema.parse(stmt.get());
}

// Close any session that has been open longer than maxAgeMs.
// completedAt is set to min(startedAt + maxAgeMs, now - maxAgeMs) so the
// row's duration stays bounded AND completedAt is always at least maxAgeMs
// in the past — that guarantees safeRestartTimerIfNeeded's 2h-recency
// check rejects these rows and they don't get auto-resumed.
// Does NOT post to Jira; caller controls that.
// Returns the closed rows so the caller can warn or audit.
export function closeStaleOpenSessions(
  maxAgeMs: number,
): Array<{ id: string; jiraTicket: string | null; startedAt: string; completedAt: string }> {
  const db = getDb();
  const cutoffMs = Date.now() - maxAgeMs;
  const cutoffIso = new Date(cutoffMs).toISOString();
  const rows = db
    .prepare('SELECT id, jiraTicket, startedAt FROM sessions WHERE completedAt IS NULL AND startedAt < ?')
    .all(cutoffIso) as Array<{ id: string; jiraTicket: string | null; startedAt: string }>;
  if (rows.length === 0) return [];
  const stmt = db.prepare('UPDATE sessions SET completedAt = ?, isAutoCompleted = 1 WHERE id = ?');
  const closed: Array<{ id: string; jiraTicket: string | null; startedAt: string; completedAt: string }> = [];
  for (const r of rows) {
    const startedMs = new Date(r.startedAt).getTime();
    const completedMs = Math.min(startedMs + maxAgeMs, cutoffMs);
    const completedAt = new Date(completedMs).toISOString();
    stmt.run(completedAt, r.id);
    closed.push({ ...r, completedAt });
  }
  return closed;
}

export function deleteOldSessions(days: number) {
  const db = getDb();
  const date = new Date();
  date.setDate(date.getDate() - days);
  const stmt = db.prepare('DELETE FROM sessions WHERE startedAt < ?');
  stmt.run(date.toISOString());
}

export function getCredential(key: string): string | null {
  const db = getDb();
  const stmt = db.prepare('SELECT value FROM credentials WHERE key = ?');
  const row = stmt.get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setCredential(key: string, value: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO credentials (key, value, updatedAt) VALUES (?, ?, ?)');
  stmt.run(key, value, new Date().toISOString());
}

export function deleteCredential(key: string) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM credentials WHERE key = ?');
  stmt.run(key);
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)');
  stmt.run(key, value, new Date().toISOString());
}

export function deleteSetting(key: string) {
  const db = getDb();
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
}

export interface AtlassianToken {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  cloud_id: string;
  site_url: string | null;
}

export function storeAtlassianToken(token: {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  cloud_id: string;
  site_url?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO atlassian_tokens (id, access_token, refresh_token, expires_at, cloud_id, site_url, createdAt) VALUES (1, ?, ?, ?, ?, ?, ?)',
  );
  stmt.run(
    token.access_token,
    token.refresh_token,
    token.expires_at,
    token.cloud_id,
    token.site_url ?? null,
    new Date().toISOString(),
  );
}

export function getAtlassianToken(): AtlassianToken | null {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT access_token, refresh_token, expires_at, cloud_id, site_url FROM atlassian_tokens WHERE id = 1',
  );
  const row = stmt.get() as AtlassianToken | undefined;
  return row ?? null;
}

export function updateAtlassianAccessToken(access_token: string, expires_at: string) {
  const db = getDb();
  const stmt = db.prepare('UPDATE atlassian_tokens SET access_token = ?, expires_at = ? WHERE id = 1');
  stmt.run(access_token, expires_at);
}

export function clearAtlassianToken() {
  const db = getDb();
  db.prepare('DELETE FROM atlassian_tokens WHERE id = 1').run();
}

// --- Projects ---

export interface Project {
  id: string;
  name: string;
  active: number;
}

export function upsertProjects(projects: Array<{ id: string; name: string }>) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO projects (id, name, active) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET name = ?',
  );
  for (const p of projects) {
    stmt.run(p.id, p.name, p.name);
  }
}

export function getAllProjects(): Project[] {
  const db = getDb();
  return db.prepare('SELECT * FROM projects ORDER BY name').all() as Project[];
}

export function getActiveProjects(): Project[] {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE active = 1 ORDER BY name').all() as Project[];
}

export function toggleProjectActive(id: string, active: boolean) {
  const db = getDb();
  db.prepare('UPDATE projects SET active = ? WHERE id = ?').run(active ? 1 : 0, id);
}
