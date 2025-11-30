import { useState, useEffect, useMemo } from 'react';
import { loadData, saveData, initializeDefaultData } from '../services/storage';
import { getFilteredData, canSwitchView, VIEW_MODE_LABELS } from '../utils/userRoles';
import { useNotifications } from './useNotifications';
import { useSuggestions } from './useSuggestions';

export const useCRM = () => {
  const [state, setState] = useState(() => initializeDefaultData());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [filters, setFilters] = useState({});
  const [currentUser, setCurrentUser] = useState(() => state.currentUser);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveData('contacts', state.contacts);
    saveData('meetings', state.meetings);
    saveData('tasks', state.tasks);
    saveData('documents', state.documents);
    saveData('team', state.team);
    saveData('statuses', state.statuses);
    saveData('users', state.users);
    saveData('settings', state.settings);
  }, [state]);

  // Save current user when it changes
  useEffect(() => {
    if (currentUser) {
      saveData('currentUser', currentUser);
    }
  }, [currentUser]);

  // Filtered data based on current user's view mode
  const filteredContacts = useMemo(() =>
    getFilteredData(state.contacts, currentUser),
    [state.contacts, currentUser]
  );

  const filteredMeetings = useMemo(() =>
    getFilteredData(state.meetings, currentUser),
    [state.meetings, currentUser]
  );

  const filteredTasks = useMemo(() =>
    getFilteredData(state.tasks, currentUser),
    [state.tasks, currentUser]
  );

  // Notifications hook
  const notificationsAPI = useNotifications(filteredMeetings, filteredTasks, filteredContacts);

  // Suggestions hook
  const suggestions = useSuggestions(state.contacts, state.meetings, state.tasks, state.statuses);

  const updateContacts = (contacts) => {
    setState(prev => ({ ...prev, contacts }));
  };

  const updateMeetings = (meetings) => {
    setState(prev => ({ ...prev, meetings }));
  };

  const updateTasks = (tasks) => {
    setState(prev => ({ ...prev, tasks }));
  };

  const updateDocuments = (documents) => {
    setState(prev => ({ ...prev, documents }));
  };

  const updateTeam = (team) => {
    setState(prev => ({ ...prev, team }));
  };

  const updateStatuses = (statuses) => {
    setState(prev => ({ ...prev, statuses }));
  };

  const updateUsers = (users) => {
    setState(prev => ({ ...prev, users }));
  };

  const updateSettings = (settings) => {
    setState(prev => ({ ...prev, settings }));
  };

  // Switch view mode
  const switchViewMode = (newMode) => {
    if (!currentUser || !canSwitchView(currentUser, newMode)) {
      console.warn('User cannot switch to this view mode');
      return false;
    }

    const updatedUser = { ...currentUser, view_mode: newMode };
    setCurrentUser(updatedUser);

    // Update user in users array
    const updatedUsers = state.users.map(u =>
      u.id === updatedUser.id ? updatedUser : u
    );
    setState(prev => ({ ...prev, users: updatedUsers }));

    return true;
  };

  // Update current user's filter preset
  const updateUserFilterPreset = (preset) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      filter_preset: { ...currentUser.filter_preset, ...preset }
    };
    setCurrentUser(updatedUser);

    // Update user in users array
    const updatedUsers = state.users.map(u =>
      u.id === updatedUser.id ? updatedUser : u
    );
    setState(prev => ({ ...prev, users: updatedUsers }));
  };

  // Check permission
  const hasPermission = (resource, action) => {
    if (!currentUser || !currentUser.permissions) return true; // Default allow if no permissions set
    const permissions = currentUser.permissions[resource];
    return permissions ? permissions[action] : false;
  };

  return {
    // Original state
    state,
    currentTab,
    setCurrentTab,
    filters,
    setFilters,
    updateContacts,
    updateMeetings,
    updateTasks,
    updateDocuments,
    updateTeam,
    updateStatuses,
    updateUsers,
    updateSettings,

    // User belonging system
    currentUser,
    setCurrentUser,
    filteredContacts,
    filteredMeetings,
    filteredTasks,
    switchViewMode,
    updateUserFilterPreset,
    hasPermission,

    // Notifications
    notifications: notificationsAPI,

    // Suggestions
    suggestions
  };
};
