import { useState, useEffect, useMemo } from 'react';

// Smart notifications hook
export const useNotifications = (meetings, tasks, contacts) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate notifications based on data
  const calculatedNotifications = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const notifs = [];

    // 1. Upcoming meetings (within 2 hours)
    meetings.forEach(meeting => {
      if (!meeting.date) return;

      const meetingDateTime = new Date(meeting.date + 'T' + (meeting.time || '00:00'));

      if (meetingDateTime > now && meetingDateTime <= twoHoursLater) {
        notifs.push({
          id: `meeting-soon-${meeting.id}`,
          type: 'meeting',
          priority: 'high',
          title: 'Upcoming Meeting',
          message: `Meeting with ${meeting.contact_name} in ${Math.round((meetingDateTime - now) / (60 * 1000))} minutes`,
          timestamp: now.toISOString(),
          data: meeting,
          icon: 'fa-calendar-check',
          color: '#f59e0b'
        });
      }
    });

    // 2. Meetings today
    meetings.forEach(meeting => {
      if (!meeting.date) return;

      const meetingDate = new Date(meeting.date + 'T00:00:00');

      if (meetingDate.getTime() === today.getTime()) {
        const meetingTime = meeting.time || '00:00';
        const meetingDateTime = new Date(meeting.date + 'T' + meetingTime);

        // Only show if meeting is later today and not already in "upcoming" notifications
        if (meetingDateTime > now) {
          const hoursDiff = (meetingDateTime - now) / (60 * 60 * 1000);
          if (hoursDiff > 2) {  // Don't duplicate with "upcoming" notifications
            notifs.push({
              id: `meeting-today-${meeting.id}`,
              type: 'meeting',
              priority: 'medium',
              title: 'Meeting Today',
              message: `Meeting with ${meeting.contact_name} at ${meetingTime}`,
              timestamp: now.toISOString(),
              data: meeting,
              icon: 'fa-calendar',
              color: '#3b82f6'
            });
          }
        }
      }
    });

    // 3. Overdue tasks
    tasks.forEach(task => {
      if (!task.due || task.status === 'Completed') return;

      const dueDate = new Date(task.due + 'T00:00:00');

      if (dueDate < today) {
        const daysOverdue = Math.floor((today - dueDate) / (24 * 60 * 60 * 1000));
        notifs.push({
          id: `task-overdue-${task.id}`,
          type: 'task',
          priority: 'high',
          title: 'Overdue Task',
          message: `"${task.task}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
          timestamp: now.toISOString(),
          data: task,
          icon: 'fa-exclamation-circle',
          color: '#ef4444'
        });
      }
    });

    // 4. Tasks due today
    tasks.forEach(task => {
      if (!task.due || task.status === 'Completed') return;

      const dueDate = new Date(task.due + 'T00:00:00');

      if (dueDate.getTime() === today.getTime()) {
        notifs.push({
          id: `task-today-${task.id}`,
          type: 'task',
          priority: 'medium',
          title: 'Task Due Today',
          message: `"${task.task}" is due today`,
          timestamp: now.toISOString(),
          data: task,
          icon: 'fa-tasks',
          color: '#f59e0b'
        });
      }
    });

    // 5. Tasks due tomorrow
    tasks.forEach(task => {
      if (!task.due || task.status === 'Completed') return;

      const dueDate = new Date(task.due + 'T00:00:00');

      if (dueDate.getTime() === tomorrow.getTime()) {
        notifs.push({
          id: `task-tomorrow-${task.id}`,
          type: 'task',
          priority: 'low',
          title: 'Task Due Tomorrow',
          message: `"${task.task}" is due tomorrow`,
          timestamp: now.toISOString(),
          data: task,
          icon: 'fa-clock',
          color: '#6b7280'
        });
      }
    });

    // 6. Contacts with no recent follow-up (no meeting in next 14 days)
    const fourteenDaysFromNow = new Date(today);
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    contacts.forEach(contact => {
      if (contact.status === 'Closed' || !contact.important) return;

      // Check if there's a meeting scheduled in the next 14 days
      const hasUpcomingMeeting = meetings.some(m => {
        if (!m.date || m.contact_name !== contact.name) return false;
        const meetingDate = new Date(m.date + 'T00:00:00');
        return meetingDate >= today && meetingDate <= fourteenDaysFromNow;
      });

      if (!hasUpcomingMeeting) {
        notifs.push({
          id: `contact-followup-${contact.id}`,
          type: 'contact',
          priority: 'low',
          title: 'Follow-up Needed',
          message: `No upcoming meeting scheduled with ${contact.name}`,
          timestamp: now.toISOString(),
          data: contact,
          icon: 'fa-user-clock',
          color: '#8b5cf6'
        });
      }
    });

    // Sort by priority (high > medium > low) and then by timestamp
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    notifs.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return notifs;
  }, [meetings, tasks, contacts]);

  // Update notifications when data changes
  useEffect(() => {
    setNotifications(calculatedNotifications);
    setUnreadCount(calculatedNotifications.length);
  }, [calculatedNotifications]);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Clear notification
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll
  };
};
