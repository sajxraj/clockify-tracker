# Dashboard

The Clocktopus dashboard is a web UI for managing timers and configuring integrations. It runs on `http://localhost:4001`.

## Starting the Dashboard

```bash
bun run build && bun run dashboard
```

## Home Tab

### Active Timer

When a timer is running, a green-bordered banner appears at the top showing:

- Timer description
- Elapsed time (updates every second)
- **Stop Timer** button

### Start Timer

Fill in the form to start a new timer:

- **Project** -- dropdown populated from `data/local-projects.json`
- **Description** -- what you're working on
- **Jira Ticket** (optional) -- e.g. `PROJ-123`. If provided, the Jira ticket title is automatically prepended to the description.

### Recent Sessions

A table showing the last 20 sessions from the local SQLite database:

| Column      | Description                                     |
| ----------- | ----------------------------------------------- |
| Description | Timer description                               |
| Project     | Project name (resolved from local-projects)     |
| Started     | When the timer was started                      |
| Duration    | Elapsed time, or "In progress" if still running |
| Jira        | Associated Jira ticket, if any                  |

### Sessions: Timeline view

The Sessions tab has two views, toggled with the **Table / Timeline** pills:

- **Table** — paginated list of recent sessions (default).
- **Timeline** — vertical day view (00:00 → 24:00) with one bar per session and red-highlighted gaps of 30 min or more. Click a bar to delete the entry; click a gap to jump to Manual Log with the gap's start/end pre-filled. The right side of the date row shows total logged time and gap stats for the selected day. View choice persists across reloads.

## Settings Tab

Configure connections to external services:

### Clockify

Enter your Clockify API key. Get one from [Manage API Keys](https://app.clockify.me/manage-api-keys).

### Google Calendar

Click **Connect Google Account** to authorize read-only access to your Google Calendar via OAuth.

### Jira

Two options:

1. **OAuth (recommended)** -- Click **Connect Atlassian** to authorize via Atlassian OAuth 2.0. See [Atlassian OAuth Setup](./atlassian-oauth.md) for configuration.
2. **API Token (fallback)** -- Expand "or use API token" and enter your Atlassian URL, email, and API token manually.

## API Endpoints

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| GET    | `/api/status`          | Check connection status of all services |
| GET    | `/api/projects`        | List local projects                     |
| GET    | `/api/sessions`        | Recent sessions with project names      |
| GET    | `/api/timer/active`    | Get currently running timer             |
| POST   | `/api/timer/start`     | Start a new timer                       |
| POST   | `/api/timer/stop`      | Stop the running timer                  |
| POST   | `/api/clockify`        | Save/validate Clockify API key          |
| POST   | `/api/jira`            | Save/validate Jira API token            |
| GET    | `/api/jira/connect`    | Initiate Atlassian OAuth flow           |
| GET    | `/api/jira/callback`   | Atlassian OAuth callback                |
| GET    | `/api/google/connect`  | Initiate Google OAuth flow              |
| GET    | `/api/google/callback` | Google OAuth callback                   |
