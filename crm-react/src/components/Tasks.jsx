import { useState, useMemo } from 'react';
import { uid, todayStr } from '../services/storage';

const Tasks = ({ tasks, updateTasks, statuses, contacts }) => {
  const [formData, setFormData] = useState({
    due: todayStr(),
    contact_name: '',
    task: '',
    owner: '',
    priority: 'Medium',
    status: statuses.task[0] || '',
    project_id: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const owners = useMemo(() => {
    return [...new Set(contacts.map(c => c.owner).filter(Boolean))];
  }, [contacts]);

  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.due) {
      newErrors.due = 'Due date required';
    }

    if (!formData.task) {
      newErrors.task = 'Task name required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newTask = {
      ...formData,
      id: uid()
    };

    updateTasks([newTask, ...tasks]);
    setFormData({
      due: todayStr(),
      contact_name: '',
      task: '',
      owner: '',
      priority: 'Medium',
      status: statuses.task[0] || '',
      project_id: '',
      notes: ''
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete task?')) {
      updateTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleUpdate = (id, field, value) => {
    updateTasks(tasks.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Task Management</div>
        <div className="muted">Track tasks and assignments</div>
        <span className="right"></span>
        <button className="pill primary" onClick={handleSubmit}>New Task</button>
      </div>

      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="grid cols-4" style={{ flex: 1 }}>
          <div>
            <label>Due Date *</label>
            <input
              type="date"
              value={formData.due}
              onChange={e => setFormData({ ...formData, due: e.target.value })}
            />
            {errors.due && <div className="error-msg show">{errors.due}</div>}
          </div>
          <div>
            <label>Contact (Name)</label>
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
          </div>
          <div>
            <label>Task *</label>
            <input
              value={formData.task}
              onChange={e => setFormData({ ...formData, task: e.target.value })}
              placeholder="e.g., Prepare proposal"
            />
            {errors.task && <div className="error-msg show">{errors.task}</div>}
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
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              {statuses.task.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Related to Project</label>
            <select
              value={formData.project_id}
              onChange={e => setFormData({ ...formData, project_id: e.target.value })}
            >
              <option value="">Not assigned</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.project_id || 'No Project ID'}
                </option>
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
        <button className="primary" onClick={handleSubmit}>Add Task</button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Contact</th>
              <th>Task</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Related to Project</th>
              <th>Notes</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const contact = contacts.find(c => c.id === task.project_id);
              const contactName = contact ? contact.name : task.contact_name;
              const priorityClass = `priority-${task.priority === 'High' ? 'high' : task.priority === 'Low' ? 'low' : 'medium'}`;

              return (
                <tr key={task.id} className="fade-in">
                  <td>{task.due}</td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => handleUpdate(task.id, 'contact_name', e.target.textContent.trim())}
                  >
                    {contactName || ''}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => handleUpdate(task.id, 'task', e.target.textContent.trim())}
                  >
                    {task.task || ''}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => handleUpdate(task.id, 'owner', e.target.textContent.trim())}
                  >
                    {task.owner || ''}
                  </td>
                  <td className={priorityClass}>{task.priority || ''}</td>
                  <td>
                    <select
                      value={task.status}
                      onChange={e => handleUpdate(task.id, 'status', e.target.value)}
                    >
                      {statuses.task.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>{contact ? `${contact.name} - ${contact.project_type}` : ''}</td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => handleUpdate(task.id, 'notes', e.target.textContent.trim())}
                  >
                    {task.notes || ''}
                  </td>
                  <td className="actions">
                    <button className="bad" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Tasks;
