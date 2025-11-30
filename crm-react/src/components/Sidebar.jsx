import { useState } from 'react';

const Sidebar = ({ currentTab, onTabChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'contacts', icon: 'fa-users', label: 'Contacts' },
    { id: 'meetings', icon: 'fa-calendar-alt', label: 'Meetings' },
    { id: 'tasks', icon: 'fa-tasks', label: 'Tasks' },
    { id: 'documents', icon: 'fa-file-alt', label: 'Documents' },
    { id: 'calendar', icon: 'fa-calendar', label: 'Calendar' },
    { id: 'team', icon: 'fa-user-friends', label: 'Team' },
    { id: 'reports', icon: 'fa-chart-bar', label: 'Reports' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">Enterprise CRM</div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`fas ${collapsed ? 'fa-bars' : 'fa-times'}`}></i>
        </button>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li key={item.id}>
            <a
              href="#"
              className={currentTab === item.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(item.id);
              }}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
