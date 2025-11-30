const Documents = ({ documents }) => {
  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Document Management</div>
        <div className="muted">Store and track project documents</div>
        <span className="right"></span>
        <button className="pill primary">Upload Document</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search documents..." style={{ minWidth: '260px' }} />
        <select>
          <option value="">All Contacts</option>
        </select>
        <select>
          <option value="">All Types</option>
          <option value="contract">Contract</option>
          <option value="proposal">Proposal</option>
          <option value="report">Report</option>
          <option value="correspondence">Correspondence</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="document-list">
        {documents.length === 0 ? (
          <div className="muted" style={{ textAlign: 'center', padding: '20px' }}>
            No documents to display
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="document-item fade-in">
              <div className="document-icon">
                <i className="fas fa-file"></i>
              </div>
              <div className="document-details">
                <div><b>{doc.name}</b></div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {doc.contact} • {doc.date}
                </div>
              </div>
              <div className="document-actions">
                <button className="ghost" title="Download">
                  <i className="fas fa-download"></i>
                </button>
                <button className="ghost" title="Delete">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Documents;
