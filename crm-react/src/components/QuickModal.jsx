import { useState, useMemo } from 'react';
import { uid, todayStr } from '../services/storage';

const QuickModal = ({ show, onClose, type, selectedContactIds, contacts, statuses, onCreateMeetings, onCreateTasks }) => {
  const [formData, setFormData] = useState({
    // Meeting fields
    date: todayStr(),
    time: '',
    subject: '',
    location: '',
    meetingOwner: '',
    meetingStatus: statuses.meeting[0] || '',
    meetingNotes: '',
    // Task fields
    due: todayStr(),
    task: '',
    taskOwner: '',
    priority: 'Medium',
    taskStatus: statuses.task[0] || '',
    taskNotes: ''
  });

  const owners = useMemo(() => {
    return [...new Set(contacts.map(c => c.owner).filter(Boolean))];
  }, [contacts]);

  const selectedContacts = useMemo(() => {
    return contacts.filter(c => selectedContactIds.includes(c.id));
  }, [contacts, selectedContactIds]);

  const handleOk = () => {
    if (selectedContacts.length === 0) {
      alert('No contacts selected');
      return;
    }

    if (type === 'meeting') {
      const meetings = selectedContacts.map(c => ({
        id: uid(),
        date: formData.date,
        time: formData.time,
        contact_name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        subject: formData.subject,
        location: formData.location,
        owner: formData.meetingOwner,
        status: formData.meetingStatus,
        notes: formData.meetingNotes
      }));
      onCreateMeetings(meetings);
    } else {
      const tasks = selectedContacts.map(c => ({
        id: uid(),
        due: formData.due,
        contact_name: c.name,
        task: formData.task,
        owner: formData.taskOwner,
        priority: formData.priority,
        status: formData.taskStatus,
        notes: formData.taskNotes
      }));
      onCreateTasks(tasks);
    }

    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={(e) => {
      if (e.target.className === 'modal') onClose();
    }}>
      <div className="sheet">
        <h3>{type === 'meeting' ? 'Create Meeting for Selected Contacts' : 'Create Task for Selected Contacts'}</h3>

        {type === 'meeting' ? (
          <div className="grid cols-2">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Subject</label>
              <input
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Initial meeting"
              />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Location</label>
              <input
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Office / Zoom"
              />
            </div>
            <div>
              <label>Assigned To</label>
              <select
                value={formData.meetingOwner}
                onChange={e => setFormData({ ...formData, meetingOwner: e.target.value })}
              >
                <option value="">Select...</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={formData.meetingStatus}
                onChange={e => setFormData({ ...formData, meetingStatus: e.target.value })}
              >
                {statuses.meeting.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Notes</label>
              <input
                value={formData.meetingNotes}
                onChange={e => setFormData({ ...formData, meetingNotes: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="grid cols-2">
            <div>
              <label>Due Date</label>
              <input
                type="date"
                value={formData.due}
                onChange={e => setFormData({ ...formData, due: e.target.value })}
              />
            </div>
            <div>
              <label>Assigned To</label>
              <select
                value={formData.taskOwner}
                onChange={e => setFormData({ ...formData, taskOwner: e.target.value })}
              >
                <option value="">Select...</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Task</label>
              <input
                value={formData.task}
                onChange={e => setFormData({ ...formData, task: e.target.value })}
                placeholder="e.g., Prepare proposal"
              />
            </div>
            <div>
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={formData.taskStatus}
                onChange={e => setFormData({ ...formData, taskStatus: e.target.value })}
              >
                {statuses.task.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Notes</label>
              <input
                value={formData.taskNotes}
                onChange={e => setFormData({ ...formData, taskNotes: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleOk}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default QuickModal;
