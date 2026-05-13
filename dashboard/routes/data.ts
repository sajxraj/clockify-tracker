import { Hono } from 'hono';
import {
  getRecentSessions,
  getSessionCount,
  getActiveProjects,
  getAllProjects,
  upsertProjects,
  toggleProjectActive,
  getSessionsInRange,
} from '../../lib/db.js';
import { Clockify } from '../../clockify.js';
import { isClockifyEnabled, isJiraDisabled } from '../../lib/credentials.js';
import { getJiraTicket } from '../../lib/jira.js';

const dataRoutes = new Hono();

// Active projects for timer dropdown
dataRoutes.get('/projects', (c) => {
  const projects = getActiveProjects();
  return c.json(projects);
});

// All projects for settings management
dataRoutes.get('/projects/all', (c) => {
  const projects = getAllProjects();
  return c.json(projects);
});

// Fetch projects from Clockify and save to DB
dataRoutes.post('/projects/fetch', async (c) => {
  if (!isClockifyEnabled()) {
    return c.json({ ok: false, error: 'Clockify not configured.' }, 400);
  }
  try {
    const clockify = new Clockify();
    const user = await clockify.getUser();
    if (!user) return c.json({ ok: false, error: 'Could not connect to Clockify.' }, 500);

    const projects = await clockify.getProjects(user.defaultWorkspace);
    if (projects.length === 0) return c.json({ ok: false, error: 'No projects found.' }, 404);

    upsertProjects(projects);
    return c.json({ ok: true, count: projects.length });
  } catch {
    return c.json({ ok: false, error: 'Failed to fetch projects.' }, 500);
  }
});

// Toggle project active status
dataRoutes.post('/projects/toggle', async (c) => {
  const { id, active } = await c.req.json<{ id: string; active: boolean }>();
  if (!id) return c.json({ ok: false, error: 'Project ID required.' }, 400);
  toggleProjectActive(id, active);
  return c.json({ ok: true });
});

// Sessions with pagination or range query
dataRoutes.get('/sessions', (c) => {
  const from = c.req.query('from');
  const to = c.req.query('to');

  const allProjects = getAllProjects();
  const projectMap = new Map(allProjects.map((p) => [p.id, p.name]));

  const enrich = (rows: Array<Record<string, unknown>>) =>
    rows.map((s) => ({
      ...s,
      projectName: s.projectId ? (projectMap.get(s.projectId as string) ?? 'Unknown') : null,
    }));

  if (from && to) {
    const fromMs = Date.parse(from);
    const toMs = Date.parse(to);
    if (Number.isNaN(fromMs) || Number.isNaN(toMs) || toMs <= fromMs) {
      return c.json({ ok: false, error: 'Invalid from/to range.' }, 400);
    }
    const rows = getSessionsInRange(from, to) as Array<Record<string, unknown>>;
    const data = enrich(rows);
    return c.json({
      data,
      page: 1,
      limit: data.length,
      total: data.length,
      totalPages: 1,
    });
  }

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '10', 10)));
  const offset = (page - 1) * limit;

  const sessions = getRecentSessions(limit, offset) as Array<Record<string, unknown>>;
  const total = getSessionCount();
  const enriched = enrich(sessions);

  return c.json({
    data: enriched,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// Current Jira ticket summary for timer description preview
dataRoutes.get('/jira/ticket-summary', async (c) => {
  const ticket = (c.req.query('jira') || '').trim().toUpperCase();
  if (!ticket || !/^[A-Z][A-Z0-9]+-\d+$/.test(ticket)) {
    return c.json({ ok: false, error: 'Invalid ticket.' }, 400);
  }
  if (isJiraDisabled()) return c.json({ ok: true, description: null });
  try {
    const issue = (await getJiraTicket(ticket)) as { fields?: { summary?: string } } | null;
    const summary = issue?.fields?.summary?.trim();
    if (summary) return c.json({ ok: true, description: summary });
  } catch (err) {
    console.warn('Jira summary lookup failed for', ticket, err);
  }
  return c.json({ ok: true, description: null });
});

export default dataRoutes;
