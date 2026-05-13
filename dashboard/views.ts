export function indexPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clocktopus Dashboard</title>
  <script>
    if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) {
      document.documentElement.classList.add('browser');
    }
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html.browser { background: #0d1117; }
    html { border-radius: 12px; overflow: hidden; height: 100vh; background: transparent; }
    body { border-radius: 12px; height: 100vh; overflow-y: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: transparent; color: #e1e4e8; padding: 2rem; }
    h1 { font-size: 1.8rem; margin-bottom: 0; color: #fff; }
    h2 { font-size: 1.1rem; color: #fff; margin-bottom: 1rem; }

    /* Nav */
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .nav { display: flex; gap: 0.25rem; background: #1c1f26; border-radius: 10px; padding: 0.3rem; flex-wrap: nowrap; }
    .nav-btn { margin-top: 0; padding: 0.5rem 0.85rem; border: none; border-radius: 6px; background: transparent; color: #8b949e; font-size: 0.9rem; cursor: pointer; white-space: nowrap; }
    .nav-btn:hover { color: #e1e4e8; }
    .nav-btn.active { background: #30363d; color: #fff; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Cards */
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
    .home-cards { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
    .card { background: #1c1f26; border: 1px solid #2d3139; border-radius: 12px; padding: 1.5rem; min-width: 0; }
    .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .card-header h2 { margin-bottom: 0; }
    .card-full { grid-column: 1 / -1; }

    /* Track tabs */
    .track-tabs { display: inline-flex; gap: 0.25rem; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 0.25rem; margin-bottom: 1rem; }
    .track-tab-btn { margin-top: 0; padding: 0.4rem 1rem; border: none; border-radius: 6px; background: transparent; color: #8b949e; font-size: 0.85rem; cursor: pointer; }
    .track-tab-btn:hover { color: #e1e4e8; }
    .track-tab-btn.active { background: #30363d; color: #fff; }

    /* Active timer */
    .active-timer { border-left: 3px solid #3fb950; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .active-timer .timer-info { flex: 1; }
    .active-timer .timer-desc { font-size: 1rem; color: #fff; font-weight: 500; }
    .active-timer .timer-elapsed { font-size: 0.9rem; color: #3fb950; margin-top: 0.25rem; }
    .stop-btn { background: #da3633; margin-top: 0; }
    .stop-btn:hover { background: #f85149; }

    /* Form elements */
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot.green { background: #3fb950; }
    .dot.red { background: #f85149; }
    .dot.gray { background: #484f58; }
    label { display: block; font-size: 0.85rem; color: #8b949e; margin-bottom: 0.25rem; margin-top: 0.75rem; }
    input, select { width: 100%; padding: 0.5rem 0.75rem; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #e1e4e8; font-size: 0.9rem; color-scheme: dark; }
    input:focus, select:focus { outline: none; border-color: #58a6ff; }
    select { appearance: none; -webkit-appearance: none; cursor: pointer; }
    button { margin-top: 1rem; padding: 0.5rem 1.25rem; background: #238636; border: none; border-radius: 6px; color: #fff; font-size: 0.9rem; cursor: pointer; }
    button:hover { background: #2ea043; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.connect { background: #1f6feb; }
    button.connect:hover { background: #388bfd; }
    .msg { font-size: 0.85rem; margin-top: 0.5rem; }
    .msg.ok { color: #3fb950; }
    .msg.err { color: #f85149; }
    .guide { font-size: 0.8rem; color: #8b949e; margin-bottom: 0.25rem; }
    .guide a { color: #58a6ff; text-decoration: none; }
    .guide a:hover { text-decoration: underline; }
    .guide ol { margin: 0.25rem 0 0 1.25rem; }
    .guide li { margin-bottom: 0.15rem; }

    /* Sessions table */
    .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .sessions-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 540px; }
    .sessions-table th { text-align: left; color: #8b949e; padding: 0.5rem 0.75rem; border-bottom: 1px solid #30363d; font-weight: 500; white-space: nowrap; }
    .sessions-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #21262d; }
    .sessions-table tr:hover { background: #161b22; }
    .sessions-table .in-progress { color: #3fb950; font-style: italic; }
    .delete-btn { background: transparent; color: #8b949e; border: none; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0 0.4rem; margin-top: 0; }
    .delete-btn:hover { color: #f85149; background: transparent; }
    .delete-btn[disabled] { color: #484f58; cursor: not-allowed; opacity: 0.5; }
    .delete-btn[disabled]:hover { color: #484f58; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 1000; }
    .modal-backdrop.open { display: flex; }
    .modal { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1.25rem 1.5rem; max-width: 420px; width: calc(100% - 2rem); }
    .modal h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #c9d1d9; }
    .modal p { margin: 0 0 1rem 0; font-size: 0.875rem; color: #8b949e; }
    .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .modal-actions button { margin-top: 0; padding: 0.4rem 0.9rem; font-size: 0.85rem; }
    .modal-actions .cancel-btn { background: #30363d; }
    .modal-actions .danger-btn { background: #da3633; }
    .modal-actions .danger-btn:hover { background: #f85149; }
    .empty-state { color: #8b949e; font-size: 0.9rem; padding: 2rem; text-align: center; }

    /* Inline form row */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-row > div { min-width: 0; }
    /* Calendar event cards */
    .cal-event-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .cal-event-card .cal-card-name { color: #e1e4e8; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.5rem; }
    .cal-event-card .cal-card-time { font-size: 0.75rem; color: #8b949e; margin-bottom: 0.4rem; }
    .cal-event-card .cal-card-badge { color: #3fb950; font-size: 0.7rem; }
    .cal-event-card select { margin-top: 0.25rem; }
    .cal-event-card.logged { opacity: 0.5; }

    @media (max-width: 600px) {
      body { padding: 0.75rem; }
      .form-row { grid-template-columns: 1fr; }
      .home-cards { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 0; align-items: stretch; margin-bottom: 1rem; }
      .header h1 { display: none; }
      .nav { justify-content: center; flex-wrap: wrap; }
      .nav-btn { padding: 0.4rem 0.7rem; font-size: 0.8rem; }
    }
    /* Project toggles */
    .project-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0; border-bottom: 1px solid #21262d; }
    .project-item:last-child { border-bottom: none; }
    .project-item label { margin: 0; color: #e1e4e8; font-size: 0.9rem; cursor: pointer; flex: 1; }
    .toggle { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
    .toggle input { opacity: 0; width: 100%; height: 100%; position: absolute; inset: 0; z-index: 1; cursor: pointer; margin: 0; }
    .toggle .slider { position: absolute; inset: 0; background: #30363d; border-radius: 10px; cursor: pointer; transition: background 0.2s; pointer-events: none; }
    .toggle .slider::before { content: ''; position: absolute; width: 16px; height: 16px; left: 2px; top: 2px; background: #8b949e; border-radius: 50%; transition: transform 0.2s, background 0.2s; }
    .toggle input:checked + .slider { background: #238636; }
    .toggle input:checked + .slider::before { transform: translateX(16px); background: #fff; }

    .empty-state-card { padding: 1.5rem; text-align: center; color: #8b949e; font-size: 0.9rem; }
    .ticket-preview { margin-top: 0.5rem; padding: 0.6rem 0.8rem; border: 1px solid #30363d; border-radius: 6px; background: #161b22; color: #e1e4e8; font-size: 0.85rem; min-height: 2rem; }
    .ticket-preview .ticket-id { color: #58a6ff; font-weight: 600; margin-right: 0.4rem; }
    .ticket-preview .ticket-hint { color: #8b949e; font-style: italic; }
    .ticket-preview .ticket-error { color: #f85149; }
    .local-hint { margin-top: 0.4rem; color: #8b949e; font-size: 0.8rem; font-style: italic; }
    .local-hint a { color: #58a6ff; }

    #ctx-menu { position: fixed; display: none; z-index: 9999; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 0.25rem; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
    #ctx-menu button { display: block; width: 100%; margin: 0; text-align: left; background: transparent; border: none; color: #e1e4e8; padding: 0.4rem 0.7rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; }
    #ctx-menu button:hover { background: #21262d; }

    /* Timeline view */
    .timeline-date-row { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap; }
    .timeline-date-row button { background:#30363d; color:#c9d1d9; border:1px solid #30363d; border-radius:6px; padding:0.3rem 0.6rem; cursor:pointer; margin:0; }
    .timeline-date-row button:hover { background:#3a414b; }
    .timeline-date-label { font-weight:600; min-width:11ch; text-align:center; }
    .timeline-summary { margin-left:auto; color:#8b949e; font-size:0.85rem; }
    .timeline-canvas-wrap { max-height:60vh; overflow-y:auto; border:1px solid #21262d; border-radius:8px; background:#0d1117; }
    .timeline-canvas { position:relative; height:720px; }
    .timeline-gutter { position:absolute; top:0; left:0; width:56px; height:100%; border-right:1px solid #21262d; }
    .timeline-gutter span { position:absolute; left:0; right:0; padding:0 0.5rem; font-size:0.7rem; color:#8b949e; transform:translateY(-50%); }
    .timeline-grid { position:absolute; top:0; left:56px; right:0; height:100%; pointer-events:none; }
    .timeline-grid div { position:absolute; left:0; right:0; height:1px; background:#161b22; }
    .timeline-track { position:absolute; top:0; left:56px; right:8px; height:100%; }
    .timeline-bar { position:absolute; left:0; right:0; background:#1f6feb; border:1px solid #388bfd; border-radius:4px; color:#fff; font-size:0.75rem; padding:2px 6px; text-align:left; cursor:pointer; overflow:hidden; display:flex; align-items:center; gap:0.4rem; line-height:1.1; }
    .timeline-bar .dot { display:inline-block; width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .timeline-bar .desc { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .timeline-bar .jira { font-size:0.7rem; background:rgba(0,0,0,0.25); padding:1px 4px; border-radius:3px; flex-shrink:0; }
    .timeline-bar.in-progress { border-style:dashed; }
    .timeline-bar.overlap { left:50%; }
    .timeline-gap { position:absolute; left:0; right:0; background:rgba(248,81,73,0.12); border-top:1px dashed #f85149; border-bottom:1px dashed #f85149; color:#f85149; font-size:0.7rem; padding:2px 6px; cursor:pointer; display:flex; align-items:center; }
    .timeline-gap:hover { background:rgba(248,81,73,0.2); }
    .timeline-now { position:absolute; left:0; right:0; height:2px; background:#f0883e; box-shadow:0 0 6px rgba(240,136,62,0.6); pointer-events:none; }
    .timeline-empty { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#8b949e; }

  </style>
</head>
<body>
  <div id="ctx-menu">
    <button type="button" onclick="location.reload()">Reload</button>
  </div>
  <div class="header">
    <h1>Clocktopus</h1>
    <div class="nav">
      <button class="nav-btn active" onclick="switchTab('home')" id="nav-home">Home</button>
      <button class="nav-btn" onclick="switchTab('sessions')" id="nav-sessions">Sessions</button>
      <button class="nav-btn" onclick="switchTab('projects')" id="nav-projects">Projects</button>
      <button class="nav-btn" onclick="switchTab('calendar')" id="nav-calendar">Calendar</button>
      <button class="nav-btn" onclick="switchTab('settings')" id="nav-settings">Settings</button>
    </div>
  </div>

  <!-- HOME TAB -->
  <div id="tab-home" class="tab-content active">

    <!-- Active Timer Banner -->
    <div id="active-timer" class="card active-timer" style="display:none; margin-bottom:1.5rem;">
      <div class="timer-info">
        <div class="timer-desc" id="active-timer-desc"></div>
        <div class="timer-elapsed" id="active-timer-elapsed"></div>
      </div>
      <button class="stop-btn" onclick="stopTimer()">Stop Timer</button>
    </div>

    <div class="cards home-cards">
      <!-- Track Time -->
      <div class="card" id="track-card">
        <div class="track-tabs" id="track-tabs">
          <button class="track-tab-btn active" data-mode="auto" onclick="switchTrackMode('auto')">Auto Track</button>
          <button class="track-tab-btn" data-mode="manual" onclick="switchTrackMode('manual')">Manual Log</button>
        </div>

        <div id="track-auto">
          <div id="start-timer-form">
            <div id="timer-project-wrap">
              <label for="project-select">Project</label>
              <select id="project-select">
                <option value="">Loading projects...</option>
              </select>
            </div>
            <div class="form-row">
              <div id="timer-description-wrap">
                <label for="timer-description">Description</label>
                <input type="text" id="timer-description" placeholder="What are you working on?" />
                <div id="timer-local-hint" class="local-hint" style="display:none;">Time will be logged locally only. Configure Clockify or Jira in <a href="#" onclick="switchTab('settings');return false;">Settings</a> to sync.</div>
              </div>
              <div>
                <label for="timer-jira" id="timer-jira-label">Jira Ticket (optional)</label>
                <input type="text" id="timer-jira" placeholder="e.g. PROJ-123" />
              </div>
            </div>
            <div id="timer-description-preview" class="ticket-preview" style="display:none;"></div>
            <label id="timer-billable-wrap" style="display:flex; align-items:center; gap:0.5rem; font-weight:normal; cursor:pointer;">
              <input type="checkbox" id="timer-billable" checked style="width:auto; margin:0;" />
              Billable
            </label>
            <button id="start-btn" onclick="startTimer()">Start Timer</button>
          </div>
          <div id="last-tasks" style="display:none; margin-top:0.75rem;"></div>
          <div class="msg" id="timer-msg"></div>
        </div>

        <div id="track-manual" style="display:none;">
          <div id="manual-project-wrap">
            <label for="manual-project">Project</label>
            <select id="manual-project">
              <option value="">Loading projects...</option>
            </select>
          </div>
          <div class="form-row" id="manual-range-wrap">
            <div>
              <label for="manual-start-date">Start</label>
              <div style="display:flex; gap:0.4rem;">
                <input type="date" id="manual-start-date" style="flex:1;" />
                <input type="time" id="manual-start-time" style="flex:1;" />
              </div>
            </div>
            <div>
              <label for="manual-end-date">End</label>
              <div style="display:flex; gap:0.4rem;">
                <input type="date" id="manual-end-date" style="flex:1;" />
                <input type="time" id="manual-end-time" style="flex:1;" />
              </div>
            </div>
          </div>
          <div id="manual-duration-wrap" style="display:none;">
            <label for="manual-duration">Time spent</label>
            <input type="text" id="manual-duration" placeholder="e.g. 1h 30m, 45m, 1.5h" />
          </div>
          <div class="form-row">
            <div id="manual-description-wrap">
              <label for="manual-description">Description</label>
              <input type="text" id="manual-description" placeholder="What did you work on?" />
              <div id="manual-local-hint" class="local-hint" style="display:none;">Time will be logged locally only. Configure Clockify or Jira in <a href="#" onclick="switchTab('settings');return false;">Settings</a> to sync.</div>
            </div>
            <div>
              <label for="manual-jira" id="manual-jira-label">Jira Ticket (optional)</label>
              <input type="text" id="manual-jira" placeholder="e.g. PROJ-123" />
            </div>
          </div>
          <div id="manual-description-preview" class="ticket-preview" style="display:none;"></div>
          <label id="manual-billable-wrap" style="display:flex; align-items:center; gap:0.5rem; font-weight:normal; cursor:pointer;">
            <input type="checkbox" id="manual-billable" checked style="width:auto; margin:0;" />
            Billable
          </label>
          <button id="manual-log-btn" onclick="logManualTime()">Log Time</button>
          <div class="msg" id="manual-msg"></div>
        </div>
      </div>


      <!-- Monitor Control -->
      <div class="card">
        <div class="card-header">
          <div class="dot gray" id="monitor-dot"></div>
          <h2>Idle Monitor</h2>
        </div>
        <p id="monitor-desc" style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Auto-stops timers when idle, resumes when active.</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button id="monitor-start-btn" onclick="monitorAction('start')" style="margin-top:0;">Start</button>
          <button id="monitor-stop-btn" onclick="monitorAction('stop')" class="stop-btn" style="margin-top:0;" disabled>Stop</button>
          <button id="monitor-restart-btn" onclick="monitorAction('restart')" style="margin-top:0;background:#30363d;" disabled>Restart</button>
        </div>
      </div>

    </div>
  </div>

  <!-- SESSIONS TAB -->
  <div id="tab-sessions" class="tab-content">
    <div class="track-tabs" id="sessions-view-tabs" style="margin-bottom:1rem;">
      <button class="track-tab-btn active" data-view="table" onclick="switchSessionsView('table')">Table</button>
      <button class="track-tab-btn" data-view="timeline" onclick="switchSessionsView('timeline')">Timeline</button>
    </div>

    <div id="sessions-view-table">
      <div class="card card-full">
        <h2>Recent Sessions</h2>
        <div id="sessions-container" class="table-wrap">
          <table class="sessions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Project</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Jira</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="sessions-body">
              <tr><td colspan="6" class="empty-state">Loading...</td></tr>
            </tbody>
          </table>
          <div id="pagination" style="display:none; margin-top:1rem; align-items:center; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
            <button id="prev-btn" onclick="changePage(-1)" style="background:#30363d; margin-top:0; padding:0.3rem 0.75rem;" disabled>&lt;</button>
            <span id="page-info" style="font-size:0.85rem; color:#8b949e;"></span>
            <button id="next-btn" onclick="changePage(1)" style="background:#30363d; margin-top:0; padding:0.3rem 0.75rem;">&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <div id="sessions-view-timeline" style="display:none;">
      <div class="card card-full">
        <div class="timeline-date-row">
          <button type="button" id="timeline-prev" aria-label="Previous day">&lsaquo;</button>
          <span id="timeline-date-label" class="timeline-date-label">--</span>
          <button type="button" id="timeline-next" aria-label="Next day">&rsaquo;</button>
          <button type="button" id="timeline-today">Today</button>
          <span class="timeline-summary" id="timeline-summary"></span>
        </div>
        <div class="timeline-canvas-wrap">
          <div id="timeline-canvas" class="timeline-canvas">
            <div class="timeline-empty" id="timeline-empty">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm modal -->
  <div id="confirm-modal" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal">
      <h3 id="confirm-title">Are you sure?</h3>
      <p id="confirm-message"></p>
      <div class="modal-actions">
        <button type="button" class="cancel-btn" id="confirm-cancel">Cancel</button>
        <button type="button" class="danger-btn" id="confirm-ok">Delete</button>
      </div>
    </div>
  </div>

  <!-- SETTINGS TAB -->
  <div id="tab-settings" class="tab-content">
    <div class="track-tabs" id="settings-subtabs" style="margin-bottom:1.25rem;">
      <button class="track-tab-btn active" data-section="auth" onclick="switchSettingsSection('auth')">Auth</button>
      <button class="track-tab-btn" data-section="reminders" onclick="switchSettingsSection('reminders')">Reminders</button>
      <button class="track-tab-btn" data-section="git" onclick="switchSettingsSection('git')">Git</button>
    </div>

    <!-- Auth section -->
    <div id="settings-auth" class="settings-section">
      <div class="cards">

        <!-- Jira -->
        <div class="card">
          <div class="card-header">
            <div class="dot gray" id="jira-dot"></div>
            <h2>Jira</h2>
          </div>
          <p id="jira-desc" style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Connect Jira with an API token to log time on tickets.</p>
          <div class="guide">
            <ol>
              <li>Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">Atlassian API Tokens</a></li>
              <li>Click <strong>Create API token</strong> and copy it</li>
            </ol>
          </div>
          <label for="jira-url">Atlassian URL</label>
          <input type="text" id="jira-url" value="https://outsidetech.atlassian.net/rest/api/3" placeholder="https://your-org.atlassian.net/rest/api/3" />
          <label for="jira-email">Email</label>
          <input type="email" id="jira-email" placeholder="you@example.com" />
          <label for="jira-token">API Token</label>
          <input type="password" id="jira-token" placeholder="Atlassian API token" />
          <button onclick="saveJira()">Save &amp; Validate</button>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-top:0.75rem;">
            <label class="toggle">
              <input type="checkbox" id="jira-enabled-toggle" onchange="toggleJiraEnabled()" />
              <span class="slider"></span>
            </label>
            <span id="jira-enabled-label" style="font-size:0.9rem; color:#8b949e;">Enabled</span>
          </div>
          <div class="msg" id="jira-msg"></div>
        </div>

        <!-- Clockify -->
        <div class="card">
          <div class="card-header">
            <div class="dot gray" id="clockify-dot"></div>
            <h2>Clockify</h2>
          </div>
          <div class="guide">
            <ol>
              <li>Go to <a href="https://app.clockify.me/manage-api-keys" target="_blank">Manage API Keys</a></li>
              <li>Click <strong>Generate</strong>, enter a name, and confirm</li>
              <li>Copy the key and paste it below</li>
            </ol>
          </div>
          <label for="clockify-key">API Key</label>
          <input type="password" id="clockify-key" placeholder="Enter your Clockify API key" />
          <button onclick="saveClockify()">Save &amp; Validate</button>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-top:0.75rem;">
            <label class="toggle">
              <input type="checkbox" id="clockify-enabled-toggle" onchange="toggleClockifyEnabled()" />
              <span class="slider"></span>
            </label>
            <span id="clockify-enabled-label" style="font-size:0.9rem; color:#8b949e;">Enabled</span>
          </div>
          <div class="msg" id="clockify-msg"></div>
        </div>

        <!-- Google Calendar -->
        <div class="card">
          <div class="card-header">
            <div class="dot gray" id="google-dot"></div>
            <h2>Google Calendar</h2>
          </div>
          <p id="google-desc" style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Authorize access to your Google Calendar.</p>
          <button class="connect" id="google-connect-btn" onclick="connectGoogle()">Connect Google Account</button>
          <p id="google-connect-note" style="font-size:0.75rem;color:#8b949e;margin-top:0.5rem;display:none;"></p>
          <div class="msg" id="google-msg"></div>
        </div>

      </div>
    </div>

    <!-- Reminders section -->
    <div id="settings-reminders" class="settings-section" style="display:none;">
      <div class="cards">

        <!-- End-of-Day Reminder -->
        <div class="card">
          <div class="card-header">
            <div class="dot gray" id="eod-dot"></div>
            <h2>End-of-Day Reminder</h2>
          </div>
          <p style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Pop a notification on weekdays at a chosen time. Click <strong>Stop</strong> to end the timer or close the notification to <strong>Snooze 15m</strong> for one more reminder. May take up to ~1 minute after the configured time to appear.</p>
          <label for="eod-time">Time (24h)</label>
          <input type="time" id="eod-time" value="18:00" />
          <button onclick="saveEod()">Save</button>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-top:0.75rem;">
            <label class="toggle">
              <input type="checkbox" id="eod-enabled" onchange="saveEod()" />
              <span class="slider"></span>
            </label>
            <span id="eod-enabled-label" style="font-size:0.9rem; color:#8b949e;">Disabled</span>
          </div>
          <div class="msg" id="eod-msg"></div>
        </div>

      </div>
    </div>

    <!-- Git section -->
    <div id="settings-git" class="settings-section" style="display:none;">
      <div class="cards">

        <!-- Global Git Hook -->
        <div class="card">
          <div class="card-header">
            <div class="dot gray" id="git-hook-dot"></div>
            <h2>Git Post-Checkout Hook</h2>
          </div>
          <p style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Installs a global Git hook that prompts to start a timer when you check out a branch. Affects every repo (unless ignored via <code>.clocktopus-ignore</code> file or the branch list below).</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button id="git-hook-install-btn" onclick="installGitHook()" style="margin-top:0;">Install hook</button>
            <button id="git-hook-uninstall-btn" onclick="uninstallGitHook()" class="stop-btn" style="margin-top:0;" disabled>Uninstall</button>
          </div>
          <div class="msg" id="git-hook-msg"></div>
        </div>

        <!-- Husky instructions -->
        <div class="card">
          <div class="card-header">
            <h2>Husky Repos</h2>
          </div>
          <p style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Husky overrides the global hook with a local <code>core.hooksPath</code>. Inside each husky-enabled repo, run this command at the project root to chain the Clocktopus hook into <code>.husky/post-checkout</code>:</p>
          <pre id="husky-cmd" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.6rem 0.75rem; font-size:0.8rem; overflow-x:auto; margin:0 0 0.5rem 0;">clocktopus hook:install-husky</pre>
          <button onclick="copyHuskyCmd()" style="margin-top:0; background:#30363d;">Copy command</button>
          <p style="font-size:0.75rem;color:#8b949e;margin-top:0.5rem;">Commit the resulting <code>.husky/post-checkout</code> so teammates using husky get it too.</p>
          <div class="msg" id="husky-msg"></div>
        </div>

        <!-- Ignored branches -->
        <div class="card">
          <div class="card-header">
            <h2>Ignored Branches</h2>
          </div>
          <p style="font-size:0.85rem;color:#8b949e;margin-bottom:0.5rem;">Branches that should never prompt — typically long-lived ones like <code>main</code> or <code>develop</code>. One branch name per line (exact match).</p>
          <textarea id="git-ignore-branches" rows="4" placeholder="main&#10;develop" style="width:100%; background:#0d1117; border:1px solid #30363d; border-radius:6px; color:#e1e4e8; padding:0.5rem; font-family:monospace; font-size:0.85rem;"></textarea>
          <button onclick="saveGitIgnoreBranches()">Save</button>
          <div class="msg" id="git-ignore-msg"></div>
        </div>

      </div>
    </div>
  </div>

  <!-- PROJECTS TAB -->
  <div id="tab-projects" class="tab-content">
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
        <h2 style="margin-bottom:0;">Projects</h2>
        <button id="fetch-projects-btn" onclick="fetchProjects()" style="margin-top:0; background:#1f6feb;">Pull from Clockify</button>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
        <p style="font-size:0.8rem; color:#8b949e; margin:0;">Toggle projects on/off to control which appear in the timer dropdown.</p>
        <a href="#" id="toggle-all-link" onclick="toggleAllProjects(event)" style="font-size:0.8rem; color:#58a6ff; text-decoration:none; white-space:nowrap; margin-left:1rem;">Deselect all</a>
      </div>
      <div class="msg" id="projects-msg"></div>
      <div id="projects-list" style="margin-top:0.5rem;"></div>
    </div>
  </div>

  <!-- CALENDAR TAB -->
  <div id="tab-calendar" class="tab-content">
    <div class="cards">
      <div class="card card-full">
        <h2>Log Calendar Events</h2>
        <div class="form-row" style="margin-top:1rem;">
          <div>
            <label for="cal-from">From</label>
            <input type="date" id="cal-from" />
          </div>
          <div>
            <label for="cal-to">To</label>
            <input type="date" id="cal-to" />
          </div>
        </div>
        <button onclick="fetchCalendarEvents()">Fetch Events</button>
        <div class="msg" id="cal-msg"></div>

        <div id="cal-table-wrap" style="display:none; margin-top:1rem;">
          <div id="cal-cards"></div>
          <button id="cal-log-btn" onclick="logCalendarEvents()" style="margin-top:1rem;">Log to Clockify</button>
          <div class="msg" id="cal-log-msg"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Suppress WebKit's Back/Forward menu. Capture-phase wins the race with
    // the native WKWebView menu. Our custom menu offers Reload only.
    (function wireContextMenu() {
      const menu = document.getElementById('ctx-menu');
      if (!menu) return;
      const hide = () => { menu.style.display = 'none'; };
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const pad = 4;
        const x = Math.min(e.clientX, window.innerWidth - menu.offsetWidth - pad);
        const y = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - pad);
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.display = 'block';
      }, { capture: true });
      window.addEventListener('click', hide);
      window.addEventListener('scroll', hide, { capture: true });
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
      window.addEventListener('blur', hide);
    })();

    let elapsedInterval = null;
    let currentPage = 1;
    let totalPages = 1;

    // --- Tab switching ---
    function switchTab(tab) {
      const nav = document.getElementById('nav-' + tab);
      if (nav && nav.getAttribute('aria-disabled') === 'true') return;
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      if (nav) nav.classList.add('active');
    }

    function switchSessionsView(view) {
      var valid = view === 'timeline' ? 'timeline' : 'table';
      try { localStorage.setItem('clocktopus.sessions.view', valid); } catch (e) {}
      var tableWrap = document.getElementById('sessions-view-table');
      var timelineWrap = document.getElementById('sessions-view-timeline');
      tableWrap.style.display = valid === 'table' ? '' : 'none';
      timelineWrap.style.display = valid === 'timeline' ? '' : 'none';
      var tabs = document.querySelectorAll('#sessions-view-tabs .track-tab-btn');
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-view') === valid) tabs[i].classList.add('active');
        else tabs[i].classList.remove('active');
      }
      if (valid === 'timeline') loadTimeline();
    }

    // stub — real impl added in later task
    function loadTimeline() {
      var empty = document.getElementById('timeline-empty');
      if (empty) empty.textContent = 'Timeline coming soon.';
    }

    function switchTrackMode(mode) {
      document.querySelectorAll('.track-tab-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
      document.getElementById('track-auto').style.display = mode === 'auto' ? 'block' : 'none';
      document.getElementById('track-manual').style.display = mode === 'manual' ? 'block' : 'none';
    }

    function switchSettingsSection(section) {
      document.querySelectorAll('#settings-subtabs .track-tab-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.section === section);
      });
      document.getElementById('settings-auth').style.display = section === 'auth' ? '' : 'none';
      document.getElementById('settings-reminders').style.display = section === 'reminders' ? '' : 'none';
      document.getElementById('settings-git').style.display = section === 'git' ? '' : 'none';
      if (section === 'git') loadGit();
    }

    // --- Utilities ---
    function setMsg(id, text, ok) {
      const el = document.getElementById(id);
      el.textContent = text;
      el.className = 'msg ' + (ok ? 'ok' : 'err');
    }

    function setDot(id, color) {
      document.getElementById(id).className = 'dot ' + color;
    }

    function formatDuration(ms) {
      const totalSec = Math.floor(ms / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
      if (m > 0) return m + 'm ' + s + 's';
      return s + 's';
    }

    function formatDate(iso) {
      if (!iso) return '-';
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return y + '/' + m + '/' + day + ' ' + time;
    }

    // --- Timer ---
    async function checkActiveTimer() {
      try {
        const res = await fetch('/api/timer/active');
        const data = await res.json();
        const banner = document.getElementById('active-timer');
        const startBtn = document.getElementById('start-btn');

        if (data.active) {
          document.getElementById('active-timer-desc').textContent = data.description || 'Timer running';
          banner.style.display = 'flex';
          startBtn.disabled = true;
          startBtn.textContent = 'Timer Running...';
          document.getElementById('last-tasks').style.display = 'none';

          if (elapsedInterval) clearInterval(elapsedInterval);
          const startTime = new Date(data.start).getTime();
          function updateElapsed() {
            const elapsed = Date.now() - startTime;
            document.getElementById('active-timer-elapsed').textContent = formatDuration(elapsed);
          }
          updateElapsed();
          elapsedInterval = setInterval(updateElapsed, 1000);
        } else {
          banner.style.display = 'none';
          startBtn.disabled = false;
          startBtn.textContent = 'Start Timer';
          if (elapsedInterval) { clearInterval(elapsedInterval); elapsedInterval = null; }
          loadLastTask();
        }
      } catch {}
    }

    async function startTimer() {
      const projectId = document.getElementById('project-select').value;
      const jiraTicket = document.getElementById('timer-jira').value.trim();
      const billable = document.getElementById('timer-billable').checked;
      const typedDescription = document.getElementById('timer-description').value.trim();
      const description = typedDescription;

      if (currentMode.clockifyOn) {
        if (!projectId) return setMsg('timer-msg', 'Please select a project.', false);
        if (!typedDescription && !jiraTicket) return setMsg('timer-msg', 'Please enter a description or Jira ticket.', false);
      } else if (currentMode.jiraOn) {
        if (!jiraTicket) return setMsg('timer-msg', 'Please enter a Jira ticket.', false);
      } else {
        if (!typedDescription) return setMsg('timer-msg', 'Please enter a description.', false);
      }

      const btn = document.getElementById('start-btn');
      btn.disabled = true;
      btn.textContent = 'Starting...';

      try {
        const res = await fetch('/api/timer/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: projectId || undefined,
            description: currentMode.clockifyOn ? (description || 'Working on a task...') : description,
            jiraTicket: jiraTicket || undefined,
            billable,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('timer-msg', 'Timer started!', true);
          document.getElementById('timer-description').value = '';
          document.getElementById('timer-jira').value = '';
          timerJiraSummary = '';
          renderTicketPreview('timer-description-preview', '', '');
          checkActiveTimer();
          loadSessions();
        } else {
          setMsg('timer-msg', data.error || 'Failed to start timer.', false);
          btn.disabled = false;
          btn.textContent = 'Start Timer';
        }
      } catch {
        setMsg('timer-msg', 'Request failed.', false);
        btn.disabled = false;
        btn.textContent = 'Start Timer';
      }
    }

    async function stopTimer() {
      try {
        const res = await fetch('/api/timer/stop', {
          method: 'POST',
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('timer-msg', 'Timer stopped.', true);
          checkActiveTimer();
          loadSessions();
        } else {
          setMsg('timer-msg', data.error || 'Failed to stop timer.', false);
        }
      } catch {
        setMsg('timer-msg', 'Request failed.', false);
      }
    }

    function toDateInputValue(date) {
      const pad = function(n) { return String(n).padStart(2, '0'); };
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    function toTimeInputValue(date) {
      const pad = function(n) { return String(n).padStart(2, '0'); };
      return pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    function setManualDefaults() {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const sd = document.getElementById('manual-start-date');
      const st = document.getElementById('manual-start-time');
      const ed = document.getElementById('manual-end-date');
      const et = document.getElementById('manual-end-time');
      if (sd) sd.value = toDateInputValue(hourAgo);
      if (st) st.value = toTimeInputValue(hourAgo);
      if (ed) ed.value = toDateInputValue(now);
      if (et) et.value = toTimeInputValue(now);
    }

    function parseDurationToSeconds(input) {
      var s = String(input || '').trim().toLowerCase();
      if (!s) return null;
      if (/^\\d+(\\.\\d+)?$/.test(s)) {
        var num = parseFloat(s);
        if (!isFinite(num) || num <= 0) return null;
        return Math.round(num * 3600);
      }
      var re = /(\\d+(?:\\.\\d+)?)\\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs)/g;
      var total = 0;
      var matched = false;
      var m;
      while ((m = re.exec(s)) !== null) {
        matched = true;
        var v = parseFloat(m[1]);
        if (!isFinite(v) || v < 0) return null;
        var unit = m[2];
        if (unit[0] === 'h') total += v * 3600;
        else if (unit[0] === 'm') total += v * 60;
        else total += v;
      }
      if (!matched) return null;
      return Math.round(total);
    }

    async function logManualTime() {
      const projectId = document.getElementById('manual-project').value;
      const typedDescription = document.getElementById('manual-description').value.trim();
      const jiraTicket = document.getElementById('manual-jira').value.trim();
      const billable = document.getElementById('manual-billable').checked;
      const description = typedDescription;
      const useDuration = currentMode.jiraOn && !currentMode.clockifyOn;

      let payload;
      if (useDuration) {
        const raw = document.getElementById('manual-duration').value;
        const seconds = parseDurationToSeconds(raw);
        if (seconds == null) return setMsg('manual-msg', 'Enter a duration like "1h 30m", "45m", or "1.5h".', false);
        if (seconds < 60) return setMsg('manual-msg', 'Duration must be at least 1 minute.', false);
        payload = { durationSeconds: seconds };
      } else {
        const startDate = document.getElementById('manual-start-date').value;
        const startTime = document.getElementById('manual-start-time').value;
        const endDate = document.getElementById('manual-end-date').value;
        const endTime = document.getElementById('manual-end-time').value;
        if (!startDate || !startTime || !endDate || !endTime) return setMsg('manual-msg', 'Please set start and end.', false);
        const startMs = new Date(startDate + 'T' + startTime).getTime();
        const endMs = new Date(endDate + 'T' + endTime).getTime();
        if (isNaN(startMs) || isNaN(endMs)) return setMsg('manual-msg', 'Invalid date.', false);
        if (endMs <= startMs) return setMsg('manual-msg', 'End must be after start.', false);
        payload = { start: new Date(startMs).toISOString(), end: new Date(endMs).toISOString() };
      }

      if (currentMode.clockifyOn) {
        if (!projectId) return setMsg('manual-msg', 'Please select a project.', false);
        if (!typedDescription && !jiraTicket) return setMsg('manual-msg', 'Please enter a description or Jira ticket.', false);
      } else if (currentMode.jiraOn) {
        if (!jiraTicket) return setMsg('manual-msg', 'Please enter a Jira ticket.', false);
      } else {
        if (!typedDescription) return setMsg('manual-msg', 'Please enter a description.', false);
      }

      const btn = document.getElementById('manual-log-btn');
      btn.disabled = true;
      btn.textContent = 'Logging...';

      try {
        const res = await fetch('/api/timer/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.assign({
            projectId: projectId || undefined,
            description: description,
            jiraTicket: jiraTicket || undefined,
            billable: billable,
          }, payload)),
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('manual-msg', 'Time logged.', true);
          document.getElementById('manual-description').value = '';
          document.getElementById('manual-jira').value = '';
          const dur = document.getElementById('manual-duration');
          if (dur) dur.value = '';
          manualJiraSummary = '';
          renderTicketPreview('manual-description-preview', '', '');
          setManualDefaults();
          loadSessions();
        } else {
          setMsg('manual-msg', data.error || 'Failed to log time.', false);
        }
      } catch {
        setMsg('manual-msg', 'Request failed.', false);
      }
      btn.disabled = false;
      btn.textContent = 'Log Time';
    }

    // --- Last Tasks ---
    var lastTasks = [];

    async function loadLastTask() {
      try {
        var res = await fetch('/api/sessions?page=1&limit=2');
        var result = await res.json();
        var container = document.getElementById('last-tasks');
        if (result.data && result.data.length > 0) {
          lastTasks = result.data;
          container.innerHTML = lastTasks.map(function(t, i) {
            var label = t.description || 'Untitled';
            if (t.projectName) label = t.projectName + ' — ' + label;
            return '<div style="display:flex; align-items:center; padding:0.5rem 0.75rem; background:#161b22; border:1px solid #30363d; font-size:0.85rem;' +
              (i === 0 ? ' border-radius:8px 8px 0 0; border-bottom:none;' : ' border-radius:0 0 8px 8px;') + '">' +
              '<span style="color:#e1e4e8; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(label) + '</span>' +
              '<button onclick="restartTask(' + i + ')" style="margin-top:0; margin-left:0.5rem; padding:0.2rem 0.6rem; font-size:0.8rem; background:#30363d; flex-shrink:0;">Restart</button>' +
            '</div>';
          }).join('');
          container.style.display = 'block';
        } else {
          container.style.display = 'none';
        }
      } catch {
        document.getElementById('last-tasks').style.display = 'none';
      }
    }

    async function restartTask(index) {
      var task = lastTasks[index];
      if (!task) return;
      var btns = document.getElementById('last-tasks').querySelectorAll('button');
      btns[index].disabled = true;
      btns[index].textContent = 'Starting...';
      try {
        var res = await fetch('/api/timer/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: task.projectId,
            description: task.description || 'Working on a task...',
            jiraTicket: task.jiraTicket || undefined,
            billable: document.getElementById('timer-billable').checked,
          }),
        });
        var data = await res.json();
        if (data.ok) {
          setMsg('timer-msg', 'Restarted task!', true);
          checkActiveTimer();
          loadSessions();
        } else {
          setMsg('timer-msg', data.error || 'Failed.', false);
        }
      } catch {
        setMsg('timer-msg', 'Request failed.', false);
      }
      btns[index].disabled = false;
      btns[index].textContent = 'Restart';
    }

    // --- Monitor ---
    async function checkMonitorStatus() {
      try {
        const res = await fetch('/api/monitor/status');
        const data = await res.json();
        const dot = document.getElementById('monitor-dot');
        const desc = document.getElementById('monitor-desc');
        const startBtn = document.getElementById('monitor-start-btn');
        const stopBtn = document.getElementById('monitor-stop-btn');
        const restartBtn = document.getElementById('monitor-restart-btn');

        if (data.running) {
          dot.className = 'dot green';
          const uptime = data.uptime ? formatDuration(Date.now() - data.uptime) : '';
          desc.textContent = 'Running' + (uptime ? ' for ' + uptime : '') + (data.restarts > 0 ? ' (' + data.restarts + ' restarts)' : '');
          desc.style.color = '#3fb950';
          startBtn.disabled = true;
          stopBtn.disabled = false;
          restartBtn.disabled = false;
        } else {
          dot.className = 'dot red';
          desc.textContent = data.status === 'stopped' ? 'Stopped' : 'Not running';
          desc.style.color = '#8b949e';
          startBtn.disabled = false;
          stopBtn.disabled = true;
          restartBtn.disabled = true;
        }
      } catch {
        document.getElementById('monitor-dot').className = 'dot gray';
      }
    }

    async function monitorAction(action) {
      const startBtn = document.getElementById('monitor-start-btn');
      const stopBtn = document.getElementById('monitor-stop-btn');
      const restartBtn = document.getElementById('monitor-restart-btn');
      const desc = document.getElementById('monitor-desc');
      const dot = document.getElementById('monitor-dot');

      const labels = { start: 'Starting', stop: 'Stopping', restart: 'Restarting' };
      const pending = labels[action] || 'Working';

      const prevDesc = desc.textContent;
      const prevColor = desc.style.color;
      const prevDot = dot.className;

      startBtn.disabled = true;
      stopBtn.disabled = true;
      restartBtn.disabled = true;
      dot.className = 'dot gray';
      desc.textContent = pending + ' monitor...';
      desc.style.color = '#d29922';

      const MIN_DISPLAY_MS = 1500;
      const started = Date.now();
      const waitMin = function() {
        const elapsed = Date.now() - started;
        return new Promise(function(r) { setTimeout(r, Math.max(0, MIN_DISPLAY_MS - elapsed)); });
      };

      try {
        const res = await fetch('/api/monitor/' + action, { method: 'POST' });
        const data = await res.json();
        await waitMin();
        if (!data.ok) {
          desc.textContent = data.output || 'Failed.';
          desc.style.color = '#f85149';
          dot.className = prevDot;
          setTimeout(checkMonitorStatus, 2500);
          return;
        }
        setTimeout(checkMonitorStatus, 500);
      } catch {
        await waitMin();
        desc.textContent = 'Request failed.';
        desc.style.color = '#f85149';
        dot.className = prevDot;
        setTimeout(checkMonitorStatus, 2500);
      }
    }

    // --- Projects ---
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        const selects = [document.getElementById('project-select'), document.getElementById('manual-project')];
        selects.forEach(function(select) {
          if (!select) return;
          select.innerHTML = '<option value="">Select a project</option>';
          if (projects.length === 0) {
            select.innerHTML = '<option value="">No active projects \u2014 pull from Clockify in Settings</option>';
            return;
          }
          projects.forEach(function(p) {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            select.appendChild(opt);
          });
        });
      } catch {
        const select = document.getElementById('project-select');
        if (select) select.innerHTML = '<option value="">Failed to load projects</option>';
        const manual = document.getElementById('manual-project');
        if (manual) manual.innerHTML = '<option value="">Failed to load projects</option>';
      }
    }

    async function fetchProjects() {
      const btn = document.getElementById('fetch-projects-btn');
      btn.disabled = true;
      btn.textContent = 'Fetching...';
      try {
        const res = await fetch('/api/projects/fetch', { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          setMsg('projects-msg', 'Pulled ' + data.count + ' projects from Clockify.', true);
          loadAllProjects();
          loadProjects();
        } else {
          setMsg('projects-msg', data.error || 'Failed.', false);
        }
      } catch {
        setMsg('projects-msg', 'Request failed.', false);
      }
      btn.disabled = false;
      btn.textContent = 'Pull from Clockify';
    }

    async function loadAllProjects() {
      try {
        const res = await fetch('/api/projects/all');
        const projects = await res.json();
        const container = document.getElementById('projects-list');

        if (projects.length === 0) {
          container.innerHTML = '<p style="color:#8b949e;font-size:0.85rem;">No projects yet. Click "Pull from Clockify" to import them.</p>';
          return;
        }

        container.innerHTML = projects.map(function(p) {
          return '<div class="project-item">' +
            '<div class="toggle">' +
              '<input type="checkbox" data-project-id="' + p.id + '" id="proj-' + p.id + '" ' + (p.active ? 'checked' : '') + ' />' +
              '<span class="slider"></span>' +
            '</div>' +
            '<label for="proj-' + p.id + '">' + escapeHtml(p.name) + '</label>' +
          '</div>';
        }).join('');
        container.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
          cb.addEventListener('change', function() {
            toggleProject(cb.dataset.projectId, cb.checked);
          });
        });
      } catch {
        document.getElementById('projects-list').innerHTML = '<p style="color:#f85149;font-size:0.85rem;">Failed to load projects.</p>';
      }
    }

    async function toggleProject(id, active) {
      try {
        const res = await fetch('/api/projects/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, active }),
        });
        if (!res.ok) console.error('Toggle failed:', await res.text());
        loadProjects();
        loadAllProjects();
        updateToggleAllLink();
      } catch (e) { console.error('Toggle error:', e); }
    }

    async function toggleAllProjects(e) {
      e.preventDefault();
      const checkboxes = document.querySelectorAll('#projects-list input[type="checkbox"]');
      if (checkboxes.length === 0) return;
      const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; });
      const newState = !allChecked;
      const promises = Array.from(checkboxes).map(function(cb) {
        cb.checked = newState;
        const id = cb.id.replace('proj-', '');
        return fetch('/api/projects/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, active: newState }),
        });
      });
      await Promise.all(promises);
      loadProjects();
      updateToggleAllLink();
    }

    function updateToggleAllLink() {
      const checkboxes = document.querySelectorAll('#projects-list input[type="checkbox"]');
      const link = document.getElementById('toggle-all-link');
      if (!link || checkboxes.length === 0) return;
      const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; });
      link.textContent = allChecked ? 'Deselect all' : 'Select all';
    }

    // --- Sessions ---
    async function loadSessions() {
      try {
        const res = await fetch('/api/sessions?page=' + currentPage + '&limit=10');
        const result = await res.json();
        const sessions = result.data;
        totalPages = result.totalPages;
        const tbody = document.getElementById('sessions-body');
        const pagination = document.getElementById('pagination');

        if (sessions.length === 0 && currentPage === 1) {
          tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No sessions yet. Start a timer to get going!</td></tr>';
          pagination.style.display = 'none';
          return;
        }

        tbody.innerHTML = sessions.map(function(s) {
          const started = formatDate(s.startedAt);
          let duration;
          if (s.completedAt) {
            const ms = new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
            duration = formatDuration(ms);
          } else {
            duration = '<span class="in-progress">In progress</span>';
          }
          const jira = s.jiraTicket || '-';
          const canDelete = !!s.completedAt && !!s.jiraWorklogId;
          const disabledAttr = canDelete ? '' : ' disabled';
          const btnTitle = canDelete
            ? 'Delete entry'
            : 'Cannot delete: no tracked Jira worklog id';
          const deleteBtn = s.completedAt
            ? '<button class="delete-btn" title="' + btnTitle + '" data-delete-id="' + escapeHtml(s.id) + '"' + disabledAttr + '>&times;</button>'
            : '';
          return '<tr>' +
            '<td>' + escapeHtml(s.description) + '</td>' +
            '<td>' + (s.projectName ? escapeHtml(s.projectName) : '—') + '</td>' +
            '<td>' + started + '</td>' +
            '<td>' + duration + '</td>' +
            '<td>' + escapeHtml(jira) + '</td>' +
            '<td style="text-align:right;">' + deleteBtn + '</td>' +
            '</tr>';
        }).join('');

        // Update pagination controls
        pagination.style.display = totalPages > 1 ? 'flex' : 'none';
        document.getElementById('prev-btn').disabled = currentPage <= 1;
        document.getElementById('next-btn').disabled = currentPage >= totalPages;
        document.getElementById('page-info').textContent = 'Page ' + currentPage + ' of ' + totalPages + ' (' + result.total + ' sessions)';
      } catch {
        document.getElementById('sessions-body').innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load sessions.</td></tr>';
      }
    }

    function changePage(delta) {
      const newPage = currentPage + delta;
      if (newPage < 1 || newPage > totalPages) return;
      currentPage = newPage;
      loadSessions();
    }

    function showConfirm(message) {
      return new Promise(function(resolve) {
        const backdrop = document.getElementById('confirm-modal');
        const msg = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');
        msg.textContent = message;
        backdrop.classList.add('open');

        function cleanup(result) {
          backdrop.classList.remove('open');
          okBtn.removeEventListener('click', onOk);
          cancelBtn.removeEventListener('click', onCancel);
          backdrop.removeEventListener('click', onBackdrop);
          document.removeEventListener('keydown', onKey);
          resolve(result);
        }
        function onOk() { cleanup(true); }
        function onCancel() { cleanup(false); }
        function onBackdrop(e) { if (e.target === backdrop) cleanup(false); }
        function onKey(e) {
          if (e.key === 'Escape') cleanup(false);
          if (e.key === 'Enter') cleanup(true);
        }
        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        backdrop.addEventListener('click', onBackdrop);
        document.addEventListener('keydown', onKey);
        okBtn.focus();
      });
    }

    async function deleteSession(id) {
      const ok = await showConfirm('Delete this entry from Clockify and Jira?');
      if (!ok) return;
      try {
        const res = await fetch('/api/timer/' + encodeURIComponent(id), { method: 'DELETE' });
        const result = await res.json();
        if (!result.ok) {
          alert(result.error || 'Failed to delete entry.');
          return;
        }
        loadSessions();
      } catch {
        alert('Failed to delete entry.');
      }
    }

    document.addEventListener('click', function(e) {
      const btn = e.target.closest && e.target.closest('[data-delete-id]');
      if (!btn || btn.disabled) return;
      deleteSession(btn.getAttribute('data-delete-id'));
    });

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // --- Settings: Clockify ---
    async function saveClockify() {
      const apiKey = document.getElementById('clockify-key').value.trim();
      if (!apiKey) return setMsg('clockify-msg', 'API key is required.', false);
      try {
        const res = await fetch('/api/clockify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('clockify-msg', 'Saved and validated successfully.', true);
          setDot('clockify-dot', 'green');
          fetchStatus();
        } else {
          setMsg('clockify-msg', data.error || 'Validation failed.', false);
          setDot('clockify-dot', 'red');
        }
      } catch {
        setMsg('clockify-msg', 'Request failed.', false);
      }
    }

    async function toggleClockifyEnabled() {
      const enabled = document.getElementById('clockify-enabled-toggle').checked;
      document.getElementById('clockify-enabled-label').textContent = enabled ? 'Enabled' : 'Disabled';
      try {
        const res = await fetch('/api/clockify/enabled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('clockify-msg', enabled ? 'Clockify enabled.' : 'Clockify disabled.', true);
          fetchStatus();
        } else {
          setMsg('clockify-msg', data.error || 'Failed to update.', false);
        }
      } catch {
        setMsg('clockify-msg', 'Request failed.', false);
      }
    }

    // --- Settings: Google ---
    function setGoogleConnected(connected, email) {
      const btn = document.getElementById('google-connect-btn');
      const desc = document.getElementById('google-desc');
      if (connected) {
        btn.textContent = 'Reconnect';
        desc.textContent = 'Connected' + (email ? ' as ' + email : '');
        desc.style.color = '#3fb950';
      } else {
        btn.textContent = 'Connect Google Account';
        desc.textContent = 'Authorize access to your Google Calendar.';
        desc.style.color = '#8b949e';
      }
    }

    async function connectGoogle() {
      try {
        const res = await fetch('/api/google/auth-url');
        const data = await res.json();
        if (data.url) {
          if (window.__TAURI__) {
            window.__TAURI__.opener.openUrl(data.url);
          } else {
            window.location.href = '/api/google/connect';
          }
        }
      } catch (e) { console.error('Connect Google error:', e); }
    }

    // --- Settings: Jira ---
    function setJiraConnected(connected) {
      const desc = document.getElementById('jira-desc');
      if (connected) {
        desc.textContent = 'Connected via API token';
        desc.style.color = '#3fb950';
      } else {
        desc.textContent = 'Connect Jira with an API token to log time on tickets.';
        desc.style.color = '#8b949e';
      }
    }

    async function toggleJiraEnabled() {
      const enabled = document.getElementById('jira-enabled-toggle').checked;
      document.getElementById('jira-enabled-label').textContent = enabled ? 'Enabled' : 'Disabled';
      try {
        const res = await fetch('/api/jira/enabled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('jira-msg', enabled ? 'Jira enabled.' : 'Jira disabled.', true);
          fetchStatus();
        } else {
          setMsg('jira-msg', data.error || 'Failed to update.', false);
        }
      } catch {
        setMsg('jira-msg', 'Request failed.', false);
      }
    }

    async function saveJira() {
      const url = document.getElementById('jira-url').value.trim();
      const email = document.getElementById('jira-email').value.trim();
      const token = document.getElementById('jira-token').value.trim();
      if (!url || !email || !token) return setMsg('jira-msg', 'All fields are required.', false);
      try {
        const res = await fetch('/api/jira', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, email, token }),
        });
        const data = await res.json();
        if (data.ok) {
          setMsg('jira-msg', 'Saved and validated successfully.', true);
          setDot('jira-dot', 'green');
          fetchStatus();
        } else {
          setMsg('jira-msg', data.error || 'Validation failed.', false);
          setDot('jira-dot', 'red');
        }
      } catch {
        setMsg('jira-msg', 'Request failed.', false);
      }
    }

    // --- Status ---
    var currentMode = { clockifyOn: true, jiraOn: false };
    var timerJiraSummary = '';
    var manualJiraSummary = '';

    function renderTicketPreview(previewId, ticket, description) {
      var el = document.getElementById(previewId);
      if (!el) return;
      if (!ticket || !description) {
        el.style.display = 'none';
        el.innerHTML = '';
        return;
      }
      el.style.display = '';
      el.innerHTML = '<span class="ticket-id">' + escapeHtml(ticket) + '</span>' + escapeHtml(description);
    }

    async function fetchTicketSummary(ticket) {
      if (!/^[A-Z][A-Z0-9]+-\d+$/.test(ticket)) return null;
      try {
        const res = await fetch('/api/jira/ticket-summary?jira=' + encodeURIComponent(ticket));
        const data = await res.json();
        if (data.ok) return data.description || '';
      } catch {}
      return null;
    }

    function debounce(fn, ms) {
      var t;
      return function() {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function(){ fn.apply(ctx, args); }, ms);
      };
    }

    async function onTimerJiraInput() {
      var ticket = document.getElementById('timer-jira').value.trim().toUpperCase();
      if (!currentMode.clockifyOn) {
        var desc = await fetchTicketSummary(ticket);
        timerJiraSummary = desc || '';
        renderTicketPreview('timer-description-preview', ticket, timerJiraSummary);
      }
    }
    async function onManualJiraInput() {
      var ticket = document.getElementById('manual-jira').value.trim().toUpperCase();
      if (!currentMode.clockifyOn) {
        var desc = await fetchTicketSummary(ticket);
        manualJiraSummary = desc || '';
        renderTicketPreview('manual-description-preview', ticket, manualJiraSummary);
      }
    }

    (function wireTicketPreviewInputs() {
      var t = document.getElementById('timer-jira');
      var m = document.getElementById('manual-jira');
      if (t) t.addEventListener('input', debounce(onTimerJiraInput, 300));
      if (m) m.addEventListener('input', debounce(onManualJiraInput, 300));
    })();

    function applyMode(data) {
      const clockifyOn = !!data.clockify;
      const jiraOn = !!data.jira;
      const localOnly = !clockifyOn && !jiraOn;
      currentMode.clockifyOn = clockifyOn;
      currentMode.jiraOn = jiraOn;

      const trackCard = document.getElementById('track-card');
      const timerLocalHint = document.getElementById('timer-local-hint');
      const manualLocalHint = document.getElementById('manual-local-hint');
      const projWrap = document.getElementById('timer-project-wrap');
      const manualProjWrap = document.getElementById('manual-project-wrap');
      const descWrap = document.getElementById('timer-description-wrap');
      const manualDescWrap = document.getElementById('manual-description-wrap');
      const descPreview = document.getElementById('timer-description-preview');
      const manualDescPreview = document.getElementById('manual-description-preview');
      const jiraInput = document.getElementById('timer-jira');
      const manualJiraInput = document.getElementById('manual-jira');
      const jiraLabel = document.getElementById('timer-jira-label');
      const manualJiraLabel = document.getElementById('manual-jira-label');
      const jiraWrap = jiraInput ? jiraInput.closest('.row') || jiraInput.parentElement : null;
      const manualJiraWrap = manualJiraInput ? manualJiraInput.closest('.row') || manualJiraInput.parentElement : null;
      const billableWrap = document.getElementById('timer-billable-wrap');
      const manualBillableWrap = document.getElementById('manual-billable-wrap');
      const manualRangeWrap = document.getElementById('manual-range-wrap');
      const manualDurationWrap = document.getElementById('manual-duration-wrap');
      const jiraOnly = jiraOn && !clockifyOn;

      if (trackCard) trackCard.style.display = '';
      if (timerLocalHint) timerLocalHint.style.display = localOnly ? '' : 'none';
      if (manualLocalHint) manualLocalHint.style.display = localOnly ? '' : 'none';
      if (manualRangeWrap) manualRangeWrap.style.display = jiraOnly ? 'none' : '';
      if (manualDurationWrap) manualDurationWrap.style.display = jiraOnly ? '' : 'none';

      if (clockifyOn) {
        if (projWrap) projWrap.style.display = '';
        if (manualProjWrap) manualProjWrap.style.display = '';
        if (descWrap) descWrap.style.display = '';
        if (manualDescWrap) manualDescWrap.style.display = '';
        if (descPreview) descPreview.style.display = 'none';
        if (manualDescPreview) manualDescPreview.style.display = 'none';
        if (jiraWrap) jiraWrap.style.display = jiraOn ? '' : 'none';
        if (manualJiraWrap) manualJiraWrap.style.display = jiraOn ? '' : 'none';
        if (jiraInput) jiraInput.required = false;
        if (manualJiraInput) manualJiraInput.required = false;
        if (jiraLabel) jiraLabel.textContent = 'Jira Ticket (optional)';
        if (manualJiraLabel) manualJiraLabel.textContent = 'Jira Ticket (optional)';
        if (billableWrap) billableWrap.style.display = '';
        if (manualBillableWrap) manualBillableWrap.style.display = '';
      } else if (jiraOn) {
        if (projWrap) projWrap.style.display = 'none';
        if (manualProjWrap) manualProjWrap.style.display = 'none';
        if (descWrap) descWrap.style.display = 'none';
        if (manualDescWrap) manualDescWrap.style.display = 'none';
        if (descPreview) { descPreview.style.display = ''; renderTicketPreview('timer-description-preview', (jiraInput ? jiraInput.value.trim().toUpperCase() : ''), timerJiraSummary); }
        if (manualDescPreview) { manualDescPreview.style.display = ''; renderTicketPreview('manual-description-preview', (manualJiraInput ? manualJiraInput.value.trim().toUpperCase() : ''), manualJiraSummary); }
        if (jiraWrap) jiraWrap.style.display = '';
        if (manualJiraWrap) manualJiraWrap.style.display = '';
        if (jiraInput) jiraInput.required = true;
        if (manualJiraInput) manualJiraInput.required = true;
        if (jiraLabel) jiraLabel.textContent = 'Jira Ticket';
        if (manualJiraLabel) manualJiraLabel.textContent = 'Jira Ticket';
        if (billableWrap) billableWrap.style.display = 'none';
        if (manualBillableWrap) manualBillableWrap.style.display = 'none';
        onTimerJiraInput();
        onManualJiraInput();
      } else {
        // Local-only: description only
        if (projWrap) projWrap.style.display = 'none';
        if (manualProjWrap) manualProjWrap.style.display = 'none';
        if (descWrap) descWrap.style.display = '';
        if (manualDescWrap) manualDescWrap.style.display = '';
        if (descPreview) descPreview.style.display = 'none';
        if (manualDescPreview) manualDescPreview.style.display = 'none';
        if (jiraWrap) jiraWrap.style.display = 'none';
        if (manualJiraWrap) manualJiraWrap.style.display = 'none';
        if (jiraInput) jiraInput.required = false;
        if (manualJiraInput) manualJiraInput.required = false;
        if (billableWrap) billableWrap.style.display = 'none';
        if (manualBillableWrap) manualBillableWrap.style.display = 'none';
      }

      // Projects tab: hide "Pull from Clockify" button
      const pullBtn = document.getElementById('fetch-projects-btn');
      if (pullBtn) pullBtn.style.display = clockifyOn ? '' : 'none';

      // Projects nav: hide entire tab when Clockify off
      const projectsNav = document.getElementById('nav-projects');
      if (projectsNav) projectsNav.style.display = clockifyOn ? '' : 'none';

      // Calendar nav: hide entire tab when Clockify off
      const calNav = document.getElementById('nav-calendar');
      if (calNav) calNav.style.display = clockifyOn ? '' : 'none';

      // Settings: Google Connect button — disable when Clockify off
      const gBtn = document.getElementById('google-connect-btn');
      const gNote = document.getElementById('google-connect-note');
      if (gBtn) gBtn.disabled = !clockifyOn;
      if (gNote) {
        if (clockifyOn) {
          gNote.textContent = '';
          gNote.style.display = 'none';
        } else {
          gNote.textContent = 'Calendar sync requires Clockify. Connect Clockify first.';
          gNote.style.display = '';
        }
      }
    }

    async function loadEod() {
      try {
        const r = await fetch('/api/settings/eod');
        const data = await r.json();
        const enabledBox = document.getElementById('eod-enabled');
        const timeInput = document.getElementById('eod-time');
        const label = document.getElementById('eod-enabled-label');
        const dot = document.getElementById('eod-dot');
        if (enabledBox) enabledBox.checked = !!data.enabled;
        if (timeInput && data.time) timeInput.value = data.time;
        if (label) label.textContent = data.enabled ? 'Enabled' : 'Disabled';
        if (dot) dot.className = 'dot ' + (data.enabled ? 'green' : 'gray');
      } catch (err) {
        console.error('Failed to load EOD settings', err);
      }
    }

    async function saveEod() {
      const enabled = document.getElementById('eod-enabled').checked;
      const time = document.getElementById('eod-time').value;
      try {
        const r = await fetch('/api/settings/eod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: enabled, time: time }),
        });
        const data = await r.json();
        if (!r.ok) {
          setMsg('eod-msg', data.error || 'Save failed.', false);
          return;
        }
        setMsg('eod-msg', 'Saved.', true);
        const label = document.getElementById('eod-enabled-label');
        const dot = document.getElementById('eod-dot');
        if (label) label.textContent = enabled ? 'Enabled' : 'Disabled';
        if (dot) dot.className = 'dot ' + (enabled ? 'green' : 'gray');
      } catch {
        setMsg('eod-msg', 'Network error.', false);
      }
    }

    // --- Settings: Git ---
    function applyGitHookInstalled(installed) {
      const dot = document.getElementById('git-hook-dot');
      const installBtn = document.getElementById('git-hook-install-btn');
      const uninstallBtn = document.getElementById('git-hook-uninstall-btn');
      if (dot) dot.className = 'dot ' + (installed ? 'green' : 'gray');
      if (installBtn) installBtn.disabled = installed;
      if (uninstallBtn) uninstallBtn.disabled = !installed;
    }

    async function loadGit() {
      try {
        const r = await fetch('/api/settings/git');
        const data = await r.json();
        applyGitHookInstalled(!!data.installed);
        const ta = document.getElementById('git-ignore-branches');
        if (ta) ta.value = Array.isArray(data.ignoreBranches) ? data.ignoreBranches.join('\\n') : '';
      } catch (err) {
        console.error('Failed to load git settings', err);
      }
    }

    async function installGitHook() {
      try {
        const r = await fetch('/api/settings/git/install', { method: 'POST' });
        const data = await r.json();
        if (!data.ok) return setMsg('git-hook-msg', data.error || 'Install failed.', false);
        applyGitHookInstalled(true);
        setMsg('git-hook-msg', 'Hook installed globally.', true);
      } catch {
        setMsg('git-hook-msg', 'Network error.', false);
      }
    }

    async function uninstallGitHook() {
      try {
        const r = await fetch('/api/settings/git/uninstall', { method: 'POST' });
        const data = await r.json();
        if (!data.ok) return setMsg('git-hook-msg', data.error || 'Uninstall failed.', false);
        applyGitHookInstalled(false);
        setMsg('git-hook-msg', 'Hook removed.', true);
      } catch {
        setMsg('git-hook-msg', 'Network error.', false);
      }
    }

    async function copyHuskyCmd() {
      const cmd = document.getElementById('husky-cmd').textContent || '';
      try {
        await navigator.clipboard.writeText(cmd);
        setMsg('husky-msg', 'Command copied. Paste in your repo root.', true);
      } catch {
        setMsg('husky-msg', 'Copy failed — select and copy manually.', false);
      }
    }

    async function saveGitIgnoreBranches() {
      const ta = document.getElementById('git-ignore-branches');
      const branches = (ta.value || '').split(/\\r?\\n/).map(function(s){return s.trim();}).filter(Boolean);
      try {
        const r = await fetch('/api/settings/git/ignore-branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branches: branches }),
        });
        const data = await r.json();
        if (!data.ok) return setMsg('git-ignore-msg', data.error || 'Save failed.', false);
        if (Array.isArray(data.ignoreBranches)) ta.value = data.ignoreBranches.join('\\n');
        setMsg('git-ignore-msg', 'Saved.', true);
      } catch {
        setMsg('git-ignore-msg', 'Network error.', false);
      }
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setDot('clockify-dot', data.clockify ? 'green' : 'red');
        setDot('google-dot', data.google ? 'green' : 'red');
        setDot('jira-dot', data.jira ? 'green' : 'red');
        if (data.clockifyKeyHint) {
          document.getElementById('clockify-key').placeholder = data.clockifyKeyHint;
        }
        const toggle = document.getElementById('clockify-enabled-toggle');
        const toggleLabel = document.getElementById('clockify-enabled-label');
        const keyInput = document.getElementById('clockify-key');
        const saveBtn = document.querySelector('button[onclick="saveClockify()"]');
        const enabled = !data.clockifyDisabled;
        if (toggle) toggle.checked = enabled;
        if (toggleLabel) toggleLabel.textContent = enabled ? 'Enabled' : 'Disabled';
        if (keyInput) keyInput.disabled = !enabled;
        if (saveBtn) saveBtn.disabled = !enabled;

        const jToggle = document.getElementById('jira-enabled-toggle');
        const jToggleLabel = document.getElementById('jira-enabled-label');
        const jToggleWrap = jToggle ? jToggle.closest('label').parentElement : null;
        const jUrl = document.getElementById('jira-url');
        const jEmail = document.getElementById('jira-email');
        const jTokenInput = document.getElementById('jira-token');
        const jSaveBtn = document.querySelector('button[onclick="saveJira()"]');
        const jiraEnabled = !data.jiraDisabled;
        if (jToggle) jToggle.checked = jiraEnabled;
        if (jToggleLabel) jToggleLabel.textContent = jiraEnabled ? 'Enabled' : 'Disabled';
        if (jToggleWrap) jToggleWrap.style.display = data.jiraConfigured ? '' : 'none';
        if (jUrl) jUrl.disabled = data.jiraConfigured && !jiraEnabled;
        if (jEmail) jEmail.disabled = data.jiraConfigured && !jiraEnabled;
        if (jTokenInput) jTokenInput.disabled = data.jiraConfigured && !jiraEnabled;
        if (jSaveBtn) jSaveBtn.disabled = data.jiraConfigured && !jiraEnabled;
        setGoogleConnected(data.google, data.googleEmail);
        setJiraConnected(data.jira);
        applyMode(data);
      } catch {}
    }

    // --- OAuth callback params ---
    (function checkUrlParams() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('jira') === 'connected') {
        switchTab('settings');
        setTimeout(function() {
          setMsg('jira-msg', 'Connected to ' + (params.get('site') || 'Atlassian') + ' successfully!', true);
          setDot('jira-dot', 'green');
        }, 100);
        window.history.replaceState({}, '', '/');
      } else if (params.get('jira') === 'error') {
        switchTab('settings');
        setTimeout(function() {
          setMsg('jira-msg', 'Connection failed: ' + (params.get('reason') || 'unknown error'), false);
        }, 100);
        window.history.replaceState({}, '', '/');
      }
    })();

    // --- Calendar ---
    let calEvents = [];
    let calProjects = [];

    async function fetchCalendarEvents() {
      const from = document.getElementById('cal-from').value;
      const to = document.getElementById('cal-to').value;
      if (!from || !to) return setMsg('cal-msg', 'Please select both dates.', false);

      const fetchBtn = document.querySelector('#tab-calendar button[onclick="fetchCalendarEvents()"]');
      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Fetching...';
      setMsg('cal-msg', '', true);
      setMsg('cal-log-msg', '', true);
      document.getElementById('cal-table-wrap').style.display = 'none';

      try {
        const res = await fetch('/api/calendar/events?start=' + encodeURIComponent(from) + '&end=' + encodeURIComponent(to));
        const data = await res.json();
        if (!res.ok) {
          setMsg('cal-msg', data.error || 'Failed to fetch events.', false);
          return;
        }
        calEvents = data.events || [];
        calProjects = data.projects || [];

        if (calEvents.length === 0) {
          setMsg('cal-msg', 'No calendar events found for this date range.', false);
          return;
        }

        setMsg('cal-msg', 'Found ' + calEvents.length + ' event(s).', true);
        renderCalendarTable();
        document.getElementById('cal-table-wrap').style.display = 'block';
      } catch {
        setMsg('cal-msg', 'Request failed.', false);
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch Events';
      }
    }

    function renderCalendarTable() {
      const cards = document.getElementById('cal-cards');
      cards.innerHTML = calEvents.map(function(ev, i) {
        const startTime = new Date(ev.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(ev.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const sd = new Date(ev.start);
        const startDay = sd.getFullYear() + '/' + String(sd.getMonth() + 1).padStart(2, '0') + '/' + String(sd.getDate()).padStart(2, '0');
        const durationMs = new Date(ev.end).getTime() - new Date(ev.start).getTime();

        const logged = ev.alreadyLogged;
        const selDisabled = logged ? ' disabled' : '';
        const badge = logged ? ' <span class="cal-card-badge">(logged)</span>' : '';

        const projectOptions = '<option value="skip">Skip</option>' +
          calProjects.map(function(p) {
            const selected = (ev.savedProjectId && ev.savedProjectId === p.id) ? ' selected' : '';
            return '<option value="' + p.id + '"' + selected + '>' + escapeHtml(p.name) + '</option>';
          }).join('');

        const billableChecked = ev.billable === false ? '' : ' checked';
        return '<div class="cal-event-card' + (logged ? ' logged' : '') + '">' +
          '<div class="cal-card-name">' + escapeHtml(ev.summary || 'Untitled') + badge + '</div>' +
          '<div class="cal-card-time">' + startDay + ' ' + startTime + ' — ' + endTime + ' (' + formatDuration(durationMs) + ')</div>' +
          '<select class="cal-project-sel" data-index="' + i + '"' + selDisabled + '>' + projectOptions + '</select>' +
          '<label style="display:flex; align-items:center; gap:0.4rem; font-size:0.75rem; color:#8b949e; margin-top:0.5rem; cursor:pointer;">' +
            '<input type="checkbox" class="cal-billable-sel" data-index="' + i + '"' + billableChecked + (logged ? ' disabled' : '') + ' style="width:auto; margin:0;" />' +
            'Billable' +
          '</label>' +
        '</div>';
      }).join('');

      document.querySelectorAll('.cal-project-sel').forEach(function(sel) {
        sel.addEventListener('change', function() {
          const idx = parseInt(sel.dataset.index);
          calEvents[idx].savedProjectId = sel.value || null;
        });
      });

      document.querySelectorAll('.cal-billable-sel').forEach(function(cb) {
        cb.addEventListener('change', function() {
          const idx = parseInt(cb.dataset.index);
          calEvents[idx].billable = cb.checked;
        });
      });
    }

    async function logCalendarEvents() {
      const entries = [];
      document.querySelectorAll('.cal-project-sel').forEach(function(sel) {
        if (sel.disabled) return;
        if (sel.value === 'skip' || !sel.value) return;
        const idx = parseInt(sel.dataset.index);
        const ev = calEvents[idx];
        const cb = document.querySelector('.cal-billable-sel[data-index="' + idx + '"]');
        const billable = cb ? cb.checked : true;
        entries.push({ projectId: sel.value, summary: ev.summary, start: ev.start, end: ev.end, billable: billable });
      });

      if (entries.length === 0) {
        return setMsg('cal-log-msg', 'No events to log. Assign projects to events you want to log.', false);
      }

      const btn = document.getElementById('cal-log-btn');
      btn.disabled = true;
      btn.textContent = 'Logging...';
      setMsg('cal-log-msg', '', true);

      try {
        const res = await fetch('/api/calendar/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: entries }),
        });
        const data = await res.json();
        if (data.ok) {
          const loggedCount = Array.isArray(data.logged) ? data.logged.length : data.logged;
          const failedCount = Array.isArray(data.failed) ? data.failed.length : data.failed;
          let msg = loggedCount + ' event(s) logged to Clockify.';
          if (failedCount > 0) msg += ' ' + failedCount + ' failed.';
          setMsg('cal-log-msg', msg, failedCount === 0);
          fetchCalendarEvents();
        } else {
          setMsg('cal-log-msg', data.error || 'Failed to log events.', false);
        }
      } catch {
        setMsg('cal-log-msg', 'Request failed.', false);
      }
      btn.disabled = false;
      btn.textContent = 'Log to Clockify';
    }

    // Set default calendar dates to today
    (function setCalendarDefaults() {
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('cal-from').value = today;
      document.getElementById('cal-to').value = today;
    })();

    // --- Init ---
    fetchStatus();
    loadProjects();
    (function restoreSessionsView() {
      try {
        var saved = localStorage.getItem('clocktopus.sessions.view');
        if (saved === 'timeline') switchSessionsView('timeline');
      } catch (e) {}
    })();
    loadSessions();
    loadLastTask();
    checkActiveTimer();
    checkMonitorStatus();
    loadAllProjects();
    loadEod();
    setManualDefaults();

  </script>
</body>
</html>`;
}
