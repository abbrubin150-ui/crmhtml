import { useState } from 'react';

const Topbar = ({ currentTab, currentUser }) => {
  const [showHelp, setShowHelp] = useState(false);

  const titles = {
    dashboard: 'Dashboard',
    contacts: 'Contacts',
    meetings: 'Meetings',
    tasks: 'Tasks',
    documents: 'Documents',
    calendar: 'Calendar',
    team: 'Team',
    reports: 'Reports',
    settings: 'Settings'
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>{titles[currentTab] || 'Enterprise CRM'}</h2>
        </div>
        <div className="user-menu">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div>{currentUser?.name || 'System Admin'}</div>
            <div className="muted" style={{ fontSize: '0.8rem' }}>
              {currentUser?.role === 'admin' ? 'Admin' : 'User'}
            </div>
          </div>
          <button className="pill ghost">
            <i className="fas fa-bell"></i>
          </button>
          <button className="pill ghost" onClick={() => setShowHelp(true)}>
            <i className="fas fa-question-circle"></i>
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="modal" style={{ display: 'flex' }} onClick={(e) => {
          if (e.target.className === 'modal') setShowHelp(false);
        }}>
          <div className="sheet">
            <h3>Enterprise CRM - User Guide</h3>
            <ol>
              <li><strong>Dashboard</strong> - Current status with metrics and recent activity.</li>
              <li><strong>Contacts</strong> - Complete management of contacts and projects with advanced filtering.</li>
              <li><strong>Meetings</strong> - Schedule and track meetings with contacts.</li>
              <li><strong>Tasks</strong> - Manage tasks and assignments with team allocation.</li>
              <li><strong>Documents</strong> - Store and track project documents.</li>
              <li><strong>Calendar</strong> - Weekly/monthly view of events.</li>
              <li><strong>Team</strong> - Manage team members and staff.</li>
              <li><strong>Reports</strong> - Advanced data analysis and performance metrics.</li>
              <li><strong>Settings</strong> - System configuration and user management.</li>
            </ol>
            <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
              <button className="primary" onClick={() => setShowHelp(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
