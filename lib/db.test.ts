import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Database } from 'bun:sqlite';

// NOTE: the SQL inside `getSessionsInRange` below is a deliberate copy of the
// query used by the exported `getSessionsInRange` in `lib/db.ts`. The tests
// exercise the SQL semantics against an in-memory DB to keep them fast and
// avoid touching the real db singleton. Keep these two queries in sync.

function makeSchema(db: Database) {
  db.exec(`
    CREATE TABLE sessions (
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
}

function insert(
  db: Database,
  row: { id: string; startedAt: string; completedAt: string | null; description?: string },
) {
  db.prepare('INSERT INTO sessions (id, projectId, description, startedAt, completedAt) VALUES (?, NULL, ?, ?, ?)').run(
    row.id,
    row.description ?? row.id,
    row.startedAt,
    row.completedAt,
  );
}

function getSessionsInRange(db: Database, fromIso: string, toIso: string) {
  return db
    .prepare(
      'SELECT * FROM sessions WHERE startedAt < ? AND (completedAt IS NULL OR completedAt > ?) ORDER BY startedAt ASC',
    )
    .all(toIso, fromIso);
}

describe('getSessionsInRange', () => {
  let db: Database;
  beforeEach(() => {
    db = new Database(':memory:');
    makeSchema(db);
  });
  afterEach(() => db.close());

  const from = '2026-05-13T00:00:00.000Z';
  const to = '2026-05-14T00:00:00.000Z';

  it('includes session fully inside the range', () => {
    insert(db, { id: 'a', startedAt: '2026-05-13T09:00:00.000Z', completedAt: '2026-05-13T10:00:00.000Z' });
    const rows = getSessionsInRange(db, from, to) as Array<{ id: string }>;
    expect(rows.map((r) => r.id)).toEqual(['a']);
  });

  it('excludes session ending exactly at from', () => {
    insert(db, { id: 'b', startedAt: '2026-05-12T23:00:00.000Z', completedAt: from });
    expect((getSessionsInRange(db, from, to) as unknown[]).length).toBe(0);
  });

  it('excludes session starting exactly at to', () => {
    insert(db, { id: 'c', startedAt: to, completedAt: '2026-05-14T01:00:00.000Z' });
    expect((getSessionsInRange(db, from, to) as unknown[]).length).toBe(0);
  });

  it('includes session that straddles from (started before, ends inside)', () => {
    insert(db, { id: 'd', startedAt: '2026-05-12T23:30:00.000Z', completedAt: '2026-05-13T00:30:00.000Z' });
    expect((getSessionsInRange(db, from, to) as Array<{ id: string }>).map((r) => r.id)).toEqual(['d']);
  });

  it('includes session that straddles to (started inside, ends after)', () => {
    insert(db, { id: 'e', startedAt: '2026-05-13T23:30:00.000Z', completedAt: '2026-05-14T00:30:00.000Z' });
    expect((getSessionsInRange(db, from, to) as Array<{ id: string }>).map((r) => r.id)).toEqual(['e']);
  });

  it('includes open (in-progress) session if startedAt < to', () => {
    insert(db, { id: 'f', startedAt: '2026-05-13T22:00:00.000Z', completedAt: null });
    expect((getSessionsInRange(db, from, to) as Array<{ id: string }>).map((r) => r.id)).toEqual(['f']);
  });

  it('excludes open session that started at/after to', () => {
    insert(db, { id: 'g', startedAt: to, completedAt: null });
    expect((getSessionsInRange(db, from, to) as unknown[]).length).toBe(0);
  });

  it('returns results sorted by startedAt ascending', () => {
    insert(db, { id: 'late', startedAt: '2026-05-13T15:00:00.000Z', completedAt: '2026-05-13T16:00:00.000Z' });
    insert(db, { id: 'early', startedAt: '2026-05-13T09:00:00.000Z', completedAt: '2026-05-13T10:00:00.000Z' });
    expect((getSessionsInRange(db, from, to) as Array<{ id: string }>).map((r) => r.id)).toEqual(['early', 'late']);
  });
});
