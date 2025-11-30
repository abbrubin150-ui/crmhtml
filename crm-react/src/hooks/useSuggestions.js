import { useMemo } from 'react';

export const useSuggestions = (contacts, meetings, tasks, statuses) => {
  // Contact name suggestions
  const contactSuggestions = useMemo(() => {
    if (!contacts) return [];

    return contacts.map(contact => ({
      value: contact.name,
      label: contact.name,
      icon: contact.important ? 'fa-star' : 'fa-user',
      iconColor: contact.important ? '#f59e0b' : '#667eea',
      meta: contact.phone || contact.email || '',
      data: contact
    }));
  }, [contacts]);

  // Owner/team member suggestions
  const ownerSuggestions = useMemo(() => {
    if (!contacts && !meetings && !tasks) return [];

    const owners = new Set();

    contacts?.forEach(c => {
      if (c.owner) owners.add(c.owner);
    });

    meetings?.forEach(m => {
      if (m.owner) owners.add(m.owner);
    });

    tasks?.forEach(t => {
      if (t.owner) owners.add(t.owner);
    });

    return Array.from(owners).map(owner => ({
      value: owner,
      label: owner,
      icon: 'fa-user-tie',
      iconColor: '#667eea'
    }));
  }, [contacts, meetings, tasks]);

  // Project type suggestions
  const projectTypeSuggestions = useMemo(() => {
    if (!statuses?.project_types) return [];

    return statuses.project_types.map(type => ({
      value: type,
      label: type,
      icon: 'fa-folder',
      iconColor: '#8b5cf6'
    }));
  }, [statuses]);

  // Location suggestions
  const locationSuggestions = useMemo(() => {
    if (!statuses?.locations) return [];

    return statuses.locations.map(location => ({
      value: location,
      label: location,
      icon: 'fa-map-marker-alt',
      iconColor: '#10b981'
    }));
  }, [statuses]);

  // Subject/task suggestions (based on common patterns)
  const subjectSuggestions = useMemo(() => {
    const subjects = new Set();

    meetings?.forEach(m => {
      if (m.subject) subjects.add(m.subject);
    });

    return Array.from(subjects).map(subject => ({
      value: subject,
      label: subject,
      icon: 'fa-comment',
      iconColor: '#3b82f6'
    }));
  }, [meetings]);

  const taskSuggestions = useMemo(() => {
    const taskNames = new Set();

    tasks?.forEach(t => {
      if (t.task) taskNames.add(t.task);
    });

    return Array.from(taskNames).map(taskName => ({
      value: taskName,
      label: taskName,
      icon: 'fa-check-circle',
      iconColor: '#10b981'
    }));
  }, [tasks]);

  // Smart suggestions for contact fields based on recent data
  const getSmartDefaults = (contactName) => {
    if (!contactName || !contacts) return {};

    const contact = contacts.find(c => c.name === contactName);

    if (contact) {
      return {
        phone: contact.phone || '',
        email: contact.email || '',
        location: contact.location || '',
        project_type: contact.project_type || '',
        owner: contact.owner || ''
      };
    }

    return {};
  };

  // Get frequent collaborators (people who often have meetings/tasks with a contact)
  const getFrequentCollaborators = (contactName) => {
    if (!contactName || !meetings || !tasks) return [];

    const collaborators = new Map();

    meetings.forEach(m => {
      if (m.contact_name === contactName && m.owner) {
        collaborators.set(m.owner, (collaborators.get(m.owner) || 0) + 1);
      }
    });

    tasks.forEach(t => {
      if (t.contact_name === contactName && t.owner) {
        collaborators.set(t.owner, (collaborators.get(t.owner) || 0) + 1);
      }
    });

    return Array.from(collaborators.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  };

  return {
    contactSuggestions,
    ownerSuggestions,
    projectTypeSuggestions,
    locationSuggestions,
    subjectSuggestions,
    taskSuggestions,
    getSmartDefaults,
    getFrequentCollaborators
  };
};
