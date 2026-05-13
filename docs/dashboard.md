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

### Calendar

The Track Time card has three sub-tabs: **Auto Track**, **Manual Log**, and **Calendar**. Calendar is a vertical day view (00:00 → 24:00) of all sessions for a chosen date. Each session renders as a bar; gaps of 30 min or more between sessions show a red diagonal-striped block. Controls:

- Date row: prev / next / today, plus a right-aligned summary `Xh Ym logged · N gaps (Xh Ym)`.
- Click a session bar → delete confirm (same flow as the Sessions table).
- Click a gap → switch to **Manual Log** with the gap's start/end pre-filled.
- Drag on empty area → ghost bar grows showing duration; release to log a session for that range (snaps to 5-minute boundaries; Escape cancels).

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
