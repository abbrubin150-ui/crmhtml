import { useState } from 'react';
import './App.css';
import { useCRM } from './hooks/useCRM';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Meetings from './components/Meetings';
import Tasks from './components/Tasks';
import Documents from './components/Documents';
import Calendar from './components/Calendar';
import Team from './components/Team';
import Reports from './components/Reports';
import Settings from './components/Settings';
import QuickModal from './components/QuickModal';

function App() {
  const {
    state,
    currentTab,
    setCurrentTab,
    updateContacts,
    updateMeetings,
    updateTasks,
    updateDocuments,
    updateTeam,
    updateStatuses,
    updateUsers,
    updateSettings,
    currentUser,
    filteredContacts,
    filteredMeetings,
    filteredTasks,
    switchViewMode,
    hasPermission,
    notifications,
    suggestions
  } = useCRM();

  const [quickModal, setQuickModal] = useState({
    show: false,
    type: 'meeting',
    selectedContactIds: []
  });

  const handleCreateMeeting = (contactIds) => {
    setQuickModal({
      show: true,
      type: 'meeting',
      selectedContactIds: contactIds
    });
  };

  const handleCreateTask = (contactIds) => {
    setQuickModal({
      show: true,
      type: 'task',
      selectedContactIds: contactIds
    });
  };

  const handleCreateMeetings = (meetings) => {
    updateMeetings([...meetings, ...state.meetings]);
  };

  const handleCreateTasks = (tasks) => {
    updateTasks([...tasks, ...state.tasks]);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            contacts={filteredContacts}
            meetings={filteredMeetings}
            tasks={filteredTasks}
            currentUser={currentUser}
          />
        );
      case 'contacts':
        return (
          <Contacts
            contacts={filteredContacts}
            updateContacts={updateContacts}
            statuses={state.statuses}
            onCreateMeeting={handleCreateMeeting}
            onCreateTask={handleCreateTask}
            hasPermission={hasPermission}
            suggestions={suggestions}
          />
        );
      case 'meetings':
        return (
          <Meetings
            meetings={filteredMeetings}
            updateMeetings={updateMeetings}
            statuses={state.statuses}
            contacts={state.contacts}
            hasPermission={hasPermission}
            suggestions={suggestions}
          />
        );
      case 'tasks':
        return (
          <Tasks
            tasks={filteredTasks}
            updateTasks={updateTasks}
            statuses={state.statuses}
            contacts={state.contacts}
            hasPermission={hasPermission}
            suggestions={suggestions}
          />
        );
      case 'documents':
        return <Documents documents={state.documents} />;
      case 'calendar':
        return <Calendar meetings={filteredMeetings} />;
      case 'team':
        return <Team team={state.team} />;
      case 'reports':
        return (
          <Reports
            contacts={filteredContacts}
            meetings={filteredMeetings}
            tasks={filteredTasks}
            currentUser={currentUser}
          />
        );
      case 'settings':
        return (
          <Settings
            statuses={state.statuses}
            updateStatuses={updateStatuses}
          />
        );
      default:
        return (
          <Dashboard
            contacts={filteredContacts}
            meetings={filteredMeetings}
            tasks={filteredTasks}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="main-content">
        <Topbar
          currentTab={currentTab}
          currentUser={currentUser}
          switchViewMode={switchViewMode}
          notifications={notifications}
          setCurrentTab={setCurrentTab}
        />
        <div className="content-area">
          <div className="wrap">
            {renderContent()}
          </div>
        </div>
      </div>

      <QuickModal
        show={quickModal.show}
        onClose={() => setQuickModal({ ...quickModal, show: false })}
        type={quickModal.type}
        selectedContactIds={quickModal.selectedContactIds}
        contacts={state.contacts}
        statuses={state.statuses}
        onCreateMeetings={handleCreateMeetings}
        onCreateTasks={handleCreateTasks}
      />
    </div>
  );
}

export default App;
