import { useState, useMemo } from 'react';
import { uid, validateEmail, todayStr, fmtDate } from '../services/storage';

const Contacts = ({ contacts, updateContacts, statuses, onCreateMeeting, onCreateTask }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    project_type: '',
    stage: '',
    project_id: '',
    location: '',
    contact_person: '',
    next_meeting: '',
    owner: '',
    source: '',
    status: statuses.contact[0] || '',
    important: false,
    created_at: todayStr(),
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  const owners = useMemo(() => {
    return [...new Set(contacts.map(c => c.owner).filter(Boolean))];
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        Object.values(c).some(v =>
          String(v).toLowerCase().includes(term)
        )
      );
    }

    // Advanced filters
    if (filters.projectType) {
      result = result.filter(c => c.project_type === filters.projectType);
    }
    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters.owner) {
      result = result.filter(c => c.owner === filters.owner);
    }
    if (filters.important !== undefined) {
      result = result.filter(c => c.important === (filters.important === 'true'));
    }
    if (filters.created) {
      const days = parseInt(filters.created);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(c => new Date(c.created_at) >= cutoff);
    }

    return result;
  }, [contacts, searchTerm, filters]);

  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Contact name required';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newContact = {
      ...formData,
      id: uid(),
      created_at: formData.created_at || new Date().toISOString()
    };

    updateContacts([newContact, ...contacts]);
    setFormData({
      name: '',
      phone: '',
      email: '',
      project_type: '',
      stage: '',
      project_id: '',
      location: '',
      contact_person: '',
      next_meeting: '',
      owner: '',
      source: '',
      status: statuses.contact[0] || '',
      important: false,
      created_at: todayStr(),
      notes: ''
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this contact?')) {
      updateContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleUpdate = (id, field, value) => {
    if (field === 'email' && value && !validateEmail(value)) {
      alert('Invalid email format');
      return;
    }

    updateContacts(contacts.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const toggleImportant = (id) => {
    updateContacts(contacts.map(c =>
      c.id === id ? { ...c, important: !c.important } : c
    ));
  };

  const toggleSelectContact = (id) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const exportCSV = () => {
    const headers = ["Created", "Contact Name", "Phone", "Email", "Project Type", "Stage", "Project ID", "Location", "Contact Person", "Next Meeting", "Assigned To", "Source", "Status", "Important", "Notes"];
    const rows = contacts.map(r => [
      fmtDate(r.created_at),
      r.name,
      r.phone || '',
      r.email || '',
      r.project_type || '',
      r.stage || '',
      r.project_id || '',
      r.location || '',
      r.contact_person || '',
      r.next_meeting || '',
      r.owner || '',
      r.source || '',
      r.status || '',
      r.important ? "Yes" : "No",
      r.notes || ''
    ]);

    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => {
        const s = String(cell ?? '');
        if (/[",\n]/.test(s)) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(',')
    ).join('\n');

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Contact Management</div>
        <div className="muted">Complete contact and project management</div>
        <span className="right"></span>
        <button className="pill" onClick={() => setShowFilters(!showFilters)}>
          Advanced Filter
        </button>
        <button className="pill primary" onClick={handleSubmit}>New Contact</button>
      </div>

      {showFilters && (
        <div className="advanced-filters">
          <h3>Advanced Filter</h3>
          <div className="filter-row">
            <div>
              <label>Project Type</label>
              <select value={filters.projectType || ''} onChange={e => setFilters({ ...filters, projectType: e.target.value })}>
                <option value="">All Types</option>
                {statuses.project_types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select value={filters.status || ''} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                {statuses.contact.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Assigned To</label>
              <select value={filters.owner || ''} onChange={e => setFilters({ ...filters, owner: e.target.value })}>
                <option value="">All Team Members</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Important?</label>
              <select value={filters.important || ''} onChange={e => setFilters({ ...filters, important: e.target.value })}>
                <option value="">All</option>
                <option value="true">Important Only</option>
                <option value="false">Regular Only</option>
              </select>
            </div>
            <div>
              <label>Creation Date</label>
              <select value={filters.created || ''} onChange={e => setFilters({ ...filters, created: e.target.value })}>
                <option value="">All Dates</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <button className="primary" onClick={() => {}}>Apply Filter</button>
            <button className="ghost" onClick={() => setFilters({})}>Reset</button>
          </div>
        </div>
      )}

      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="grid cols-4" style={{ flex: 1 }}>
          <div>
            <label>Contact Name *</label>
            <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Smith"
            />
            {errors.name && <div className="error-msg show">{errors.name}</div>}
          </div>
          <div>
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="555-000-0000"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com"
            />
            {errors.email && <div className="error-msg show">{errors.email}</div>}
          </div>
          <div>
            <label>Project Type</label>
            <input
              value={formData.project_type}
              onChange={e => setFormData({ ...formData, project_type: e.target.value })}
              placeholder="e.g., Consulting / Sales / Support ..."
            />
          </div>
          <div>
            <label>Project Stage</label>
            <input
              value={formData.stage}
              onChange={e => setFormData({ ...formData, stage: e.target.value })}
              placeholder="e.g., Initial / Proposal / Implementation ..."
            />
          </div>
          <div>
            <label>Project ID</label>
            <input
              value={formData.project_id}
              onChange={e => setFormData({ ...formData, project_id: e.target.value })}
              placeholder="PRJ-2023-001"
            />
          </div>
          <div>
            <label>Location</label>
            <input
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., New York / Remote ..."
            />
          </div>
          <div>
            <label>Contact Person</label>
            <input
              value={formData.contact_person}
              onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="Contact person name"
            />
          </div>
          <div>
            <label>Next Meeting</label>
            <input
              type="date"
              value={formData.next_meeting}
              onChange={e => setFormData({ ...formData, next_meeting: e.target.value })}
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
            <label>Source</label>
            <input
              value={formData.source}
              onChange={e => setFormData({ ...formData, source: e.target.value })}
              placeholder="Referral / Website / Social Media"
            />
          </div>
          <div>
            <label>Contact Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              {statuses.contact.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Important?</label>
            <select
              value={formData.important}
              onChange={e => setFormData({ ...formData, important: e.target.value === 'true' })}
            >
              <option value="false">Regular</option>
              <option value="true">Important</option>
            </select>
          </div>
          <div>
            <label>Creation Date</label>
            <input
              type="date"
              value={formData.created_at}
              onChange={e => setFormData({ ...formData, created_at: e.target.value })}
            />
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
        <button className="primary" onClick={handleSubmit}>Add Contact</button>
      </div>

      <div className="toolbar">
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search contact / phone / project"
          style={{ minWidth: '260px' }}
        />
        <button className="good" onClick={() => onCreateMeeting(Array.from(selectedContacts))}>
          Create Meeting for Selected
        </button>
        <button className="warn" onClick={() => onCreateTask(Array.from(selectedContacts))}>
          Create Task for Selected
        </button>
        <button className="ghost" onClick={exportCSV}>Export Selected</button>
        <span className="hint">Select contacts in first column → Create meeting/task with pulled details</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Created</th>
              <th>Contact Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Project Type</th>
              <th>Stage</th>
              <th>Project ID</th>
              <th>Location</th>
              <th>Contact Person</th>
              <th>Next Meeting</th>
              <th>Assigned To</th>
              <th>Source</th>
              <th>Status</th>
              <th>Important</th>
              <th>Notes</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id} className="fade-in">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => toggleSelectContact(contact.id)}
                  />
                </td>
                <td>{fmtDate(contact.created_at)}</td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'name', e.target.textContent.trim())}
                >
                  {contact.name}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'phone', e.target.textContent.trim())}
                >
                  {contact.phone || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'email', e.target.textContent.trim())}
                >
                  {contact.email || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'project_type', e.target.textContent.trim())}
                >
                  {contact.project_type || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'stage', e.target.textContent.trim())}
                >
                  {contact.stage || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'project_id', e.target.textContent.trim())}
                >
                  {contact.project_id || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'location', e.target.textContent.trim())}
                >
                  {contact.location || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'contact_person', e.target.textContent.trim())}
                >
                  {contact.contact_person || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'next_meeting', e.target.textContent.trim())}
                >
                  {contact.next_meeting || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'owner', e.target.textContent.trim())}
                >
                  {contact.owner || ''}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'source', e.target.textContent.trim())}
                >
                  {contact.source || ''}
                </td>
                <td>
                  <select
                    value={contact.status}
                    onChange={e => handleUpdate(contact.id, 'status', e.target.value)}
                  >
                    {statuses.contact.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {contact.important && <span className="badge">Important</span>}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleUpdate(contact.id, 'notes', e.target.textContent.trim())}
                >
                  {contact.notes || ''}
                </td>
                <td className="actions">
                  <button
                    className="ghost"
                    title="Meeting"
                    onClick={() => onCreateMeeting([contact.id])}
                  >
                    📅
                  </button>
                  <button
                    className="ghost"
                    title="Task"
                    onClick={() => onCreateTask([contact.id])}
                  >
                    ✅
                  </button>
                  <button
                    className="ghost"
                    title="Mark Important"
                    onClick={() => toggleImportant(contact.id)}
                  >
                    {contact.important ? '★' : '☆'}
                  </button>
                  <button
                    className="bad"
                    title="Delete"
                    onClick={() => handleDelete(contact.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="hint" style={{ marginTop: '6px' }}>
        Quick edit: Click on a cell to edit. Statuses open as selection. Everything saves automatically.
      </div>
    </section>
  );
};

export default Contacts;
