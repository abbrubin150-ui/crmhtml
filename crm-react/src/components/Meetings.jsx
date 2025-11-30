import { useState, useMemo } from 'react';
import { uid, todayStr } from '../services/storage';

const Meetings = ({ meetings, updateMeetings, statuses, contacts }) => {
  const [formData, setFormData] = useState({
    date: todayStr(),
    time: '',
    contact_name: '',
    phone: '',
    email: '',
    subject: '',
    location: '',
    owner: '',
    status: statuses.meeting[0] || '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const owners = useMemo(() => {
    return [...new Set(contacts.map(c => c.owner).filter(Boolean))];
  }, [contacts]);

  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date required';
    }

    if (!formData.contact_name) {
      newErrors.contact = 'Contact name required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newMeeting = {
      ...formData,
      id: uid()
    };

    updateMeetings([newMeeting, ...meetings]);
    setFormData({
      date: todayStr(),
      time: '',
      contact_name: '',
      phone: '',
      email: '',
      subject: '',
      location: '',
      owner: '',
      status: statuses.meeting[0] || '',
      notes: ''
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete meeting?')) {
      updateMeetings(meetings.filter(m => m.id !== id));
    }
  };

  const handleUpdate = (id, field, value) => {
    updateMeetings(meetings.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Meeting Management</div>
        <div className="muted">Schedule and track meetings with contacts</div>
        <span className="right"></span>
        <button className="pill primary" onClick={handleSubmit}>New Meeting</button>
      </div>

      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="grid cols-4" style={{ flex: 1 }}>
          <div>
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
            {errors.date && <div className="error-msg show">{errors.date}</div>}
          </div>
          <div>
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div>
            <label>Contact (Name) *</label>
            <input
              value={formData.contact_name}
              onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Contact name"
              list="contactNames"
            />
            <datalist id="contactNames">
              {contacts.map(c => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            {errors.contact && <div className="error-msg show">{errors.contact}</div>}
          </div>
          <div>
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="555-..."
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="mail@..."
            />
          </div>
          <div>
            <label>Subject</label>
            <input
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Initial consultation"
            />
          </div>
          <div>
            <label>Location / Platform</label>
            <input
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="Office / Zoom"
            />
          </div>
          <div>
            <label>Assigned To</label>
            <select
              value={formData.owner}
              onChange={e => setFormData({ ...formData, owner: e.target.value })}
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
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              {statuses.meeting.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information"
              rows="2"
            />
          </div>
        </div>
        <button className="primary" onClick={handleSubmit}>Add Meeting</button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Location</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Notes</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id} className="fade-in">
                <td>{meeting.date}</td>
                <td>{meeting.time || ''}</td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'contact_name', e.target.textContent.trim())}
                >
                  {meeting.contact_name}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'phone', e.target.textContent.trim())}
                >
                  {meeting.phone || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'email', e.target.textContent.trim())}
                >
                  {meeting.email || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'subject', e.target.textContent.trim())}
                >
                  {meeting.subject || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'location', e.target.textContent.trim())}
                >
                  {meeting.location || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'owner', e.target.textContent.trim())}
                >
                  {meeting.owner || ''}
                </td>
                <td>
                  <select
                    value={meeting.status}
                    onChange={e => handleUpdate(meeting.id, 'status', e.target.value)}
                  >
                    {statuses.meeting.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(meeting.id, 'notes', e.target.textContent.trim())}
                >
                  {meeting.notes || ''}
                </td>
                <td className="actions">
                  <button className="bad" onClick={() => handleDelete(meeting.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Meetings;
