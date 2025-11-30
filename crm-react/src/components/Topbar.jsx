import { useState } from 'react';
import { VIEW_MODE_LABELS, getAvailableViewModes } from '../utils/userRoles';
import Notifications from './Notifications';

const Topbar = ({ currentTab, currentUser, switchViewMode, notifications, setCurrentTab }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const availableViewModes = currentUser ? getAvailableViewModes(currentUser) : [];

  const handleNotificationClick = (notification) => {
    // Navigate to the relevant tab based on notification type
    switch (notification.type) {
      case 'meeting':
        setCurrentTab('meetings');
        break;
      case 'task':
        setCurrentTab('tasks');
        break;
      case 'contact':
        setCurrentTab('contacts');
        break;
      default:
        break;
    }
  };

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

  const handleViewModeChange = (e) => {
    const newMode = e.target.value;
    const success = switchViewMode(newMode);
    if (success) {
      setToastMessage(`Switched to ${VIEW_MODE_LABELS[newMode]}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0 }}>{titles[currentTab] || 'Enterprise CRM'}</h2>
          {currentUser?.view_mode && (
            <span className="scope-badge" style={{ marginLeft: '1rem', fontSize: '0.8rem' }}>
              <i className="fas fa-filter"></i> {VIEW_MODE_LABELS[currentUser.view_mode]}
            </span>
          )}
        </div>
        <div className="user-menu">
          {availableViewModes.length > 1 && (
            <select
              value={currentUser?.view_mode || 'my_data'}
              onChange={handleViewModeChange}
              className="view-mode-select"
              style={{ marginRight: '1rem', padding: '0.5rem' }}
            >
              {availableViewModes.map(mode => (
                <option key={mode} value={mode}>
                  {VIEW_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          )}
          <div className="user-avatar">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div>{currentUser?.name || 'System Admin'}</div>
            <div className="muted" style={{ fontSize: '0.8rem' }}>
              {currentUser?.role === 'admin' ? 'Admin' : currentUser?.role?.replace('_', ' ') || 'User'}
            </div>
          </div>
          <Notifications
            notifications={notifications.notifications}
            unreadCount={notifications.unreadCount}
            markAsRead={notifications.markAsRead}
            markAllAsRead={notifications.markAllAsRead}
            clearNotification={notifications.clearNotification}
            onNotificationClick={handleNotificationClick}
          />
          <button className="pill ghost" onClick={() => setShowHelp(true)}>
            <i className="fas fa-question-circle"></i>
          </button>
        </div>
      </div>

      {showToast && (
        <div className="toast" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#4CAF50',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 10000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <i className="fas fa-check-circle"></i> {toastMessage}
        </div>
      )}

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
