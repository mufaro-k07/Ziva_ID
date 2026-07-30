// src/pages/admin/AdminDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/admin.css';

/* --- Inline SVG Icons */
const IconQueue = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconUserPlus = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLogOut = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [filterType, setFilterType] = useState('ALL');
  const navigate = useNavigate();

  // Mock staff Active Directory identity
  const officerName = "Officer P. Kunze";
  const officerId = "RG-HARARE-042";

  // Initial Review Queue state matching your screenshots
  const [applications, setApplications] = useState([
    {
      id: "ZIV-2026-8841",
      citizen: "Mufaro Moyo",
      nationalId: "63-2345678-F-42",
      docType: "Birth Certificate",
      submitted: "28 Jul 2026",
      status: "verified",
      type: "Self-Service"
    },
    {
      id: "ZIV-2026-8890",
      citizen: "Tendai Chiwenga",
      nationalId: "08-1122334-X-12",
      docType: "National ID Card",
      submitted: "29 Jul 2026",
      status: "pending",
      type: "Assisted Citizen"
    },
    {
      id: "ZIV-2026-8912",
      citizen: "Chipo Ndlovu",
      nationalId: "75-9988776-Q-04",
      docType: "Birth Certificate",
      submitted: "29 Jul 2026",
      status: "pending",
      type: "Self-Service"
    },
    {
      id: "ZIV-2026-8945",
      citizen: "Farai Gumbura",
      nationalId: "N/A (First ID)",
      docType: "National ID Card",
      submitted: "29 Jul 2026",
      status: "rejected",
      type: "Assisted Citizen"
    }
  ]);

  // Handle status updates from the officer dropdown
  const handleStatusChange = (ticketId, newStatus) => {
    setApplications(prev =>
      prev.map(app => (app.id === ticketId ? { ...app, status: newStatus } : app))
    );
  };

  // Handle new assisted citizen registration submission
  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    alert("Assisted Citizen Record Captured & Routed to Civil Registry Database!");
    setActiveTab('queue');
  };

  const filteredApps = filterType === 'ALL' 
    ? applications 
    : applications.filter(app => app.docType === filterType);

  return (
    <div className="admin-container">
      {/* Dark Sidebar with Red Identity */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">Registrar General</div>
          <div className="admin-badge-label">ZivaID Officer Portal</div>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <IconQueue />
            <span>Review Queue</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'intake' ? 'active' : ''}`}
            onClick={() => setActiveTab('intake')}
          >
            <IconUserPlus />
            <span>Assisted Citizen Intake</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <IconShield />
            <span>Audit Logs & Security</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <IconUser />
            <span>Officer Session</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <IconLogOut />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Header Bar */}
        <header className="admin-topbar">
          <div className="flag-bar-top">
            <span className="flag-green"></span>
            <span className="flag-yellow"></span>
            <span className="flag-red"></span>
            <span className="flag-black"></span>
          </div>

          <div style={{ fontWeight: '700', fontSize: '18px', color: '#0F172A' }}>
            {activeTab === 'queue' && "Civic Document Verification Queue"}
            {activeTab === 'intake' && "Assisted Citizen Registration (Walk-In Portal)"}
            {activeTab === 'audit' && "Government Security & Action Audit Trail"}
            {activeTab === 'profile' && "Active Directory Officer Credentials"}
          </div>

          <div className="admin-profile-badge">
            <div className="admin-avatar">PK</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{officerName}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Station: {officerId}</div>
            </div>
          </div>
        </header>

        {/* Dynamic Body Area */}
        <div className="admin-content">
          {/* TAB 1: REVIEW QUEUE (Overview & Status Control) */}
          {activeTab === 'queue' && (
            <>
              {/* System Metrics Ribbon */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-title">Pending Verification</span>
                  <span className="metric-value">
                    {applications.filter(a => a.status === 'pending').length}
                  </span>
                  <span className="metric-sub">Requires Officer Review</span>
                </div>
                <div className="metric-card">
                  <span className="metric-title">Verified Today</span>
                  <span className="metric-value">
                    {applications.filter(a => a.status === 'verified').length}
                  </span>
                  <span className="metric-sub">Approved & Signed</span>
                </div>
                <div className="metric-card">
                  <span className="metric-title">Assisted Intakes</span>
                  <span className="metric-value">
                    {applications.filter(a => a.type === 'Assisted Citizen').length}
                  </span>
                  <span className="metric-sub" style={{ color: '#0369A1' }}>Walk-in Registrations</span>
                </div>
                <div className="metric-card">
                  <span className="metric-title">Flagged / Rejected</span>
                  <span className="metric-value">
                    {applications.filter(a => a.status === 'rejected').length}
                  </span>
                  <span className="metric-sub" style={{ color: '#DC2626' }}>Discrepancies Found</span>
                </div>
              </div>

              {/* Applications Table */}
              <section className="admin-card">
                <div className="admin-card-header">
                  <h2>Active Document Submission Records</h2>
                  <div className="filter-bar">
                    <select 
                      className="filter-select"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="ALL">All Documents</option>
                      <option value="Birth Certificate">Birth Certificates</option>
                      <option value="National ID Card">National IDs</option>
                    </select>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Citizen Legal Name</th>
                      <th>National ID / Reg #</th>
                      <th>Document Type</th>
                      <th>Submission Tier</th>
                      <th>Verification Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: '600' }}>{app.id}</td>
                        <td>{app.citizen}</td>
                        <td style={{ color: '#64748B' }}>{app.nationalId}</td>
                        <td>{app.docType}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: app.type === 'Assisted Citizen' ? '#E0F2FE' : '#F1F5F9',
                            color: app.type === 'Assisted Citizen' ? '#0369A1' : '#475569'
                          }}>
                            {app.type}
                          </span>
                        </td>
                        <td>
                          <select
                            className={`status-select ${app.status}`}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          >
                            <option value="pending">PENDING</option>
                            <option value="verified">VERIFIED</option>
                            <option value="rejected">REJECTED</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            className="btn-action"
                            onClick={() => navigate(`/admin/review/${app.id}`)}
                          >
                            Inspect Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {/* TAB 2: ASSISTED CITIZEN INTAKE FORM */}
          {activeTab === 'intake' && (
            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Assisted Citizen Walk-In Registration</h2>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    Capture records for citizens without email accounts or digital literacy. No password required.
                  </p>
                </div>
              </div>

              <form onSubmit={handleIntakeSubmit}>
                <div className="intake-form-grid">
                  <div className="form-field">
                    <label>Full Legal Name (as on paper records)</label>
                    <input type="text" placeholder="e.g. Farai Gumbura" required />
                  </div>

                  <div className="form-field">
                    <label>Document Service Type</label>
                    <select required>
                      <option value="birth">Birth Certificate (First Issue or Copy)</option>
                      <option value="id">National ID Card Registration</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Date of Birth</label>
                    <input type="date" required />
                  </div>

                  <div className="form-field">
                    <label>District / Registry Province</label>
                    <select>
                      <option>Harare Metropolitan</option>
                      <option>Bulawayo Province</option>
                      <option>Manicaland (Mutare)</option>
                      <option>Midlands (Gweru)</option>
                      <option>Masvingo</option>
                    </select>
                  </div>

                  <div className="form-field full-width">
                    <label>Physical Residential Address or Village Chief Details</label>
                    <input type="text" placeholder="e.g. House 412, Highfield, Harare" required />
                  </div>

                  <div className="form-field full-width">
                    <label>Officer Audit Notes & Supporting Documents Verified</label>
                    <textarea 
                      rows="3" 
                      placeholder="List physical documents presented (e.g., Parent National IDs, Hospital Birth Record)..."
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel-intake" onClick={() => setActiveTab('queue')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-intake">
                    Register & Stamp Assisted Record
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 3: AUDIT LOGS PLACEHOLDER */}
          {activeTab === 'audit' && (
            <section className="admin-card" style={{ padding: '32px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                System Audit Trail & Anti-Corruption Logs
              </h3>
              <p style={{ color: '#64748B', marginTop: '8px' }}>
                All status modifications and assisted intakes by {officerName} are logged with immutable timestamps.
              </p>
            </section>
          )}

          {/* TAB 4: OFFICER SESSION PLACEHOLDER */}
          {activeTab === 'profile' && (
            <section className="admin-card" style={{ padding: '32px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                Active Directory Staff Profile
              </h3>
              <p style={{ color: '#64748B', marginTop: '8px' }}>
                Logged in as Officer ID: {officerId} | Security Clearance Level: Senior Registrar
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;