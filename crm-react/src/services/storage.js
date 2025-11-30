// Local Storage Service
import { migrateUsersToV2 } from '../utils/userRoles';

const LS_KEYS = {
  contacts: 'crm_enterprise_contacts',
  meetings: 'crm_enterprise_meetings',
  tasks: 'crm_enterprise_tasks',
  documents: 'crm_enterprise_documents',
  team: 'crm_enterprise_team',
  statuses: 'crm_enterprise_statuses',
  users: 'crm_enterprise_users',
  settings: 'crm_enterprise_settings',
  currentUser: 'crm_enterprise_current_user'
};

export const DEFAULT_STATUSES = {
  contact: ["New", "In Progress", "Waiting for Contact", "Closed"],
  meeting: ["Scheduled", "Completed", "Cancelled", "No Show"],
  task: ["Open", "In Progress", "Completed", "On Hold"],
  project_types: ["Consulting", "Sales", "Support", "Implementation", "Marketing", "Development"],
  locations: ["New York", "London", "Remote", "On-site", "Chicago", "Los Angeles"],
  team: []
};

export const loadData = (key) => {
  try {
    const data = localStorage.getItem(LS_KEYS[key]);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return null;
  }
};

export const saveData = (key, value) => {
  try {
    localStorage.setItem(LS_KEYS[key], JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
    alert('Error saving data. Local storage might be full.');
  }
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const fmtDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US');
  } catch (e) {
    return d;
  }
};

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const validateEmail = (email) => {
  if (!email) return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const initializeDefaultData = () => {
  const contacts = loadData('contacts') || [];
  const meetings = loadData('meetings') || [];
  const tasks = loadData('tasks') || [];
  const documents = loadData('documents') || [];
  const team = loadData('team') || [];
  const statuses = loadData('statuses') || { ...DEFAULT_STATUSES };
  let users = loadData('users') || [];
  const settings = loadData('settings') || {};

  // Create default admin user if no users exist
  if (users.length === 0) {
    users = [{
      id: uid(),
      name: "System Admin",
      email: "admin@company.com",
      role: "admin",
      active: true,
      created: new Date().toISOString(),
      lastLogin: null
    }];
  }

  // Migrate users to V2 (with belonging system)
  users = migrateUsersToV2(users);
  saveData('users', users);

  // Create example data if empty
  if (contacts.length === 0 && meetings.length === 0 && tasks.length === 0) {
    const exampleContacts = [{
      id: uid(),
      created_at: new Date().toISOString(),
      name: 'Example - Sarah Johnson',
      phone: '555-123-4567',
      email: 'sarah@example.com',
      project_type: 'Consulting',
      stage: 'Proposal',
      project_id: 'PRJ-2023-001',
      location: 'New York',
      contact_person: 'John Smith',
      next_meeting: '',
      owner: 'John Smith',
      source: 'Referral',
      status: statuses.contact[0],
      important: false,
      notes: 'Interested in consulting services'
    }];

    const exampleMeetings = [{
      id: uid(),
      date: todayStr(),
      time: '10:30',
      contact_name: 'Example - Sarah Johnson',
      phone: '555-123-4567',
      email: 'sarah@example.com',
      subject: 'Initial meeting',
      location: 'Office',
      owner: 'John Smith',
      status: statuses.meeting[0],
      notes: ''
    }];

    const exampleTasks = [{
      id: uid(),
      due: todayStr(),
      contact_name: 'Example - Sarah Johnson',
      task: 'Prepare proposal',
      owner: 'John Smith',
      priority: 'Medium',
      status: statuses.task[0],
      notes: ''
    }];

    return {
      contacts: exampleContacts,
      meetings: exampleMeetings,
      tasks: exampleTasks,
      documents,
      team,
      statuses,
      users,
      settings
    };
  }

  // Get or set current user (default to first user)
  let currentUser = loadData('currentUser');
  if (!currentUser && users.length > 0) {
    currentUser = users[0];
    saveData('currentUser', currentUser);
  }

  return {
    contacts,
    meetings,
    tasks,
    documents,
    team,
    statuses,
    users,
    settings,
    currentUser
  };
};
