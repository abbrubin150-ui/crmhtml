import { useState, useEffect } from 'react';
import { loadData, saveData, initializeDefaultData } from '../services/storage';

export const useCRM = () => {
  const [state, setState] = useState(() => initializeDefaultData());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [filters, setFilters] = useState({});

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

  return {
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
    updateSettings
  };
};
