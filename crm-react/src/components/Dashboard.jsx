import { useMemo } from 'react';
import { fmtDate, startOfDay } from '../services/storage';

const Dashboard = ({ contacts, meetings, tasks }) => {
  const stats = useMemo(() => {
    const openTasks = tasks.filter(t => t.status !== "Completed");

    const now = startOfDay(new Date());
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingMeetings = meetings.filter(m => {
      if (!m.date) return false;
      const mDate = new Date(m.date);
      return mDate >= now && mDate <= sevenDaysLater;
    }).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

    const overdueTasks = tasks.filter(t =>
      t.status !== "Completed" && t.due && new Date(t.due) < now
    );

    const revenue = contacts.length * 2500;

    return {
      contactCount: contacts.length,
      openTaskCount: openTasks.length,
      upcomingMeetingCount: upcomingMeetings.length,
      revenue,
      upcomingMeetings: upcomingMeetings.slice(0, 8),
      overdueTasks: overdueTasks.slice(0, 8)
    };
  }, [contacts, meetings, tasks]);

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Overview</div>
        <div className="muted">Current business status</div>
        <span className="right"></span>
        <select>
          <option value="7">Last 7 days</option>
          <option value="30" selected>Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid cols-4" style={{ marginTop: '8px' }}>
        <div className="card">
          <div className="kpi">
            <b>{stats.contactCount}</b>
            <span>Active Contacts</span>
          </div>
          <div className="hint">Total contacts in system</div>
        </div>
        <div className="card">
          <div className="kpi">
            <b>{stats.openTaskCount}</b>
            <span>Open Tasks</span>
          </div>
          <div className="hint">Including in-progress/paused (excluding completed)</div>
        </div>
        <div className="card">
          <div className="kpi">
            <b>{stats.upcomingMeetingCount}</b>
            <span>Meetings in 7 days</span>
          </div>
          <div className="hint">Upcoming meetings in the next week</div>
        </div>
        <div className="card">
          <div className="kpi">
            <b>{stats.revenue.toLocaleString()}</b>
            <span>Estimated Revenue</span>
          </div>
          <div className="hint">Monthly estimated revenue</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: '12px' }}>
        <div className="card">
          <h3>Upcoming Meetings</h3>
          <div className="list">
            {stats.upcomingMeetings.map(m => (
              <div key={m.id} className="fade-in">
                <span className="badge">{m.date} {m.time || ''}</span> · <b>{m.contact_name}</b> — {m.subject || ''} <span className="muted">({m.location || ''})</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Overdue Tasks</h3>
          <div className="list">
            {stats.overdueTasks.map(t => (
              <div key={t.id} className="fade-in">
                <span className="badge" style={{ background: 'var(--bad)', color: 'white' }}>Overdue</span> · <b>{t.task}</b> — {t.contact_name || ''} <span className="muted">(Due: {t.due})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: '12px' }}>
        <div className="card">
          <h3>Recent Activity</h3>
          <div className="audit-log">
            <div className="audit-item fade-in">
              <div><b>System initialized</b></div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>Just now</div>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Contacts by Status</h3>
          <div className="chart-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: '#4CAF50', borderRadius: '2px' }}></div>
                <div>In Progress ({Math.floor(stats.contactCount * 0.6)})</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: '#2196F3', borderRadius: '2px' }}></div>
                <div>New ({Math.floor(stats.contactCount * 0.2)})</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: '#FFC107', borderRadius: '2px' }}></div>
                <div>Waiting for Contact ({Math.floor(stats.contactCount * 0.1)})</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: '#9E9E9E', borderRadius: '2px' }}></div>
                <div>Closed ({Math.floor(stats.contactCount * 0.1)})</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
