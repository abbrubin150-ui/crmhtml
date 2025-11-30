import { useMemo } from 'react';
import { startOfDay } from '../services/storage';

const Reports = ({ contacts, meetings, tasks }) => {
  const reportData = useMemo(() => {
    const teamMembers = [...new Set(contacts.map(c => c.owner).filter(Boolean))];

    return teamMembers.map(member => {
      const memberContacts = contacts.filter(c => c.owner === member);
      const memberMeetings = meetings.filter(m => m.owner === member);
      const memberTasks = tasks.filter(t => t.owner === member);
      const completedTasks = memberTasks.filter(t => t.status === "Completed");
      const overdueTasks = memberTasks.filter(t =>
        t.due && new Date(t.due) < startOfDay(new Date()) && t.status !== "Completed"
      );
      const completionRate = memberTasks.length > 0
        ? Math.round((completedTasks.length / memberTasks.length) * 100)
        : 0;

      return {
        member,
        contactCount: memberContacts.length,
        meetingCount: memberMeetings.length,
        completedTaskCount: completedTasks.length,
        overdueTaskCount: overdueTasks.length,
        completionRate
      };
    });
  }, [contacts, meetings, tasks]);

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Reports & Analytics</div>
        <div className="muted">Data analysis and performance metrics</div>
        <span className="right"></span>
        <select>
          <option value="7">7 days</option>
          <option value="30" defaultValue>30 days</option>
          <option value="90">90 days</option>
          <option value="365">Year</option>
        </select>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Activity by Team Member</h3>
          <div className="chart-container">
            <div className="muted">Activity by Team Member chart</div>
          </div>
        </div>
        <div className="card">
          <h3>Contacts by Project Type</h3>
          <div className="chart-container">
            <div className="muted">Contacts by Project Type chart</div>
          </div>
        </div>
        <div className="card">
          <h3>Tasks by Status</h3>
          <div className="chart-container">
            <div className="muted">Tasks by Status chart</div>
          </div>
        </div>
        <div className="card">
          <h3>Meetings by Month</h3>
          <div className="chart-container">
            <div className="muted">Meetings by Month chart</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <h3>Detailed Activity Report</h3>
        <table>
          <thead>
            <tr>
              <th>Team Member</th>
              <th>New Contacts</th>
              <th>Meetings</th>
              <th>Tasks Completed</th>
              <th>Overdue Tasks</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map(data => (
              <tr key={data.member} className="fade-in">
                <td>{data.member}</td>
                <td>{data.contactCount}</td>
                <td>{data.meetingCount}</td>
                <td>{data.completedTaskCount}</td>
                <td>{data.overdueTaskCount}</td>
                <td>{data.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Reports;
