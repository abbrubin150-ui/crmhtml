import { useState, useEffect } from 'react';
import { DEFAULT_STATUSES } from '../services/storage';

const Settings = ({ statuses, updateStatuses }) => {
  const [statusTexts, setStatusTexts] = useState({
    contact: '',
    meeting: '',
    task: '',
    project_types: '',
    locations: '',
    team: ''
  });

  useEffect(() => {
    setStatusTexts({
      contact: statuses.contact.join('\n'),
      meeting: statuses.meeting.join('\n'),
      task: statuses.task.join('\n'),
      project_types: statuses.project_types.join('\n'),
      locations: statuses.locations.join('\n'),
      team: statuses.team.map(m => `${m.name}:${m.role}:${m.email}`).join(',\n')
    });
  }, [statuses]);

  const handleSave = () => {
    const parseList = (s, fallback) => {
      const a = (s || '').split(/\n|,/).map(x => x.trim()).filter(Boolean);
      return a.length ? Array.from(new Set(a)) : fallback;
    };

    const parseTeam = (s) => {
      if (!s.trim()) return [];
      return s.split(',').map(item => {
        const parts = item.split(':');
        return {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          name: parts[0]?.trim() || '',
          role: parts[1]?.trim() || '',
          email: parts[2]?.trim() || ''
        };
      });
    };

    const newStatuses = {
      contact: parseList(statusTexts.contact, DEFAULT_STATUSES.contact),
      meeting: parseList(statusTexts.meeting, DEFAULT_STATUSES.meeting),
      task: parseList(statusTexts.task, DEFAULT_STATUSES.task),
      project_types: parseList(statusTexts.project_types, DEFAULT_STATUSES.project_types),
      locations: parseList(statusTexts.locations, DEFAULT_STATUSES.locations),
      team: parseTeam(statusTexts.team)
    };

    updateStatuses(newStatuses);
    alert('Settings saved successfully');
  };

  const handleReset = () => {
    if (window.confirm('Reset settings to defaults?')) {
      updateStatuses({ ...DEFAULT_STATUSES });
      alert('Settings reset to defaults.');
    }
  };

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">System Settings</div>
        <div className="muted">Manage settings and configuration</div>
      </div>

      <div className="grid cols-3" style={{ marginTop: '8px' }}>
        <div className="card">
          <h3>Contact Status</h3>
          <textarea
            className="mono"
            rows="6"
            placeholder="New, In Progress, Waiting for Contact, Closed"
            value={statusTexts.contact}
            onChange={e => setStatusTexts({ ...statusTexts, contact: e.target.value })}
          />
        </div>
        <div className="card">
          <h3>Meeting Status</h3>
          <textarea
            className="mono"
            rows="6"
            placeholder="Scheduled, Completed, Cancelled, No Show"
            value={statusTexts.meeting}
            onChange={e => setStatusTexts({ ...statusTexts, meeting: e.target.value })}
          />
        </div>
        <div className="card">
          <h3>Task Status</h3>
          <textarea
            className="mono"
            rows="6"
            placeholder="Open, In Progress, Completed, On Hold"
            value={statusTexts.task}
            onChange={e => setStatusTexts({ ...statusTexts, task: e.target.value })}
          />
        </div>
        <div className="card">
          <h3>Project Types</h3>
          <textarea
            className="mono"
            rows="6"
            placeholder="Consulting, Sales, Support, Implementation"
            value={statusTexts.project_types}
            onChange={e => setStatusTexts({ ...statusTexts, project_types: e.target.value })}
          />
        </div>
        <div className="card">
          <h3>Locations</h3>
          <textarea
            className="mono"
            rows="6"
            placeholder="New York, London, Remote, On-site"
            value={statusTexts.locations}
            onChange={e => setStatusTexts({ ...statusTexts, locations: e.target.value })}
          />
        </div>
        <div className="card">
          <h3>Team Members</h3>
          <textarea
            className="mono"
            rows="6"
            placeholder="Name:Role:Email, Name:Role:Email"
            value={statusTexts.team}
            onChange={e => setStatusTexts({ ...statusTexts, team: e.target.value })}
          />
        </div>
      </div>

      <div className="toolbar">
        <button className="good" onClick={handleSave}>Save Settings</button>
        <button className="ghost" onClick={handleReset}>Reset to Defaults</button>
        <span className="hint">Write each item on a new line or separated by commas. Will immediately affect selection fields.</span>
      </div>

      <div className="import-export-section">
        <h3>User Management</h3>
        <div className="toolbar">
          <button className="primary">Add User</button>
          <button className="ghost">Manage Permissions</button>
        </div>

        <table style={{ marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="fade-in">
              <td>System Admin</td>
              <td>admin@company.com</td>
              <td>admin</td>
              <td><span className="badge">Active</span></td>
              <td>{new Date().toLocaleDateString()}</td>
              <td className="actions">
                <button className="ghost">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Settings;
