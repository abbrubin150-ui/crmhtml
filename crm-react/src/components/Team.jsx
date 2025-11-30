const Team = ({ team }) => {
  const defaultTeam = [
    { id: '1', name: 'John Smith', role: 'Manager', email: 'john@company.com', phone: '555-111-1111' },
    { id: '2', name: 'Sarah Johnson', role: 'Senior Consultant', email: 'sarah@company.com', phone: '555-222-2222' },
    { id: '3', name: 'Michael Brown', role: 'Consultant', email: 'michael@company.com', phone: '555-333-3333' },
    { id: '4', name: 'Emily Davis', role: 'Assistant', email: 'emily@company.com', phone: '555-444-4444' }
  ];

  const teamMembers = team.length > 0 ? team : defaultTeam;

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Team Management</div>
        <div className="muted">Manage team members and staff</div>
        <span className="right"></span>
        <button className="pill primary">Add Member</button>
      </div>

      <div className="team-grid">
        {teamMembers.map(member => {
          const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

          return (
            <div key={member.id} className="team-member fade-in">
              <div className="team-avatar">{initials}</div>
              <div><b>{member.name}</b></div>
              <div className="muted">{member.role}</div>
              <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                <div>{member.email}</div>
                <div>{member.phone}</div>
              </div>
              <div className="toolbar" style={{ justifyContent: 'center', marginTop: '12px' }}>
                <button className="ghost"><i className="fas fa-envelope"></i></button>
                <button className="ghost"><i className="fas fa-phone"></i></button>
                <button className="ghost"><i className="fas fa-edit"></i></button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Team;
