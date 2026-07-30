// src/pages/citizen/CitizenDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../../lib/auth-client';
import '../../assets/dashboard.css';

/* Including Icons*/
const IconHome = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);
const IconFileText = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconClock = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconLogOut = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DOC_TYPE_LABELS = {
  national_id: "National ID Card",
  birth_certificate: "Birth Certificate",
};

const STATUS_DISPLAY = {
  submitted: { label: "Submitted", badgeClass: "status-processing" },
  under_review: { label: "Under Review", badgeClass: "status-processing" },
  missing_information: { label: "Missing Information", badgeClass: "status-processing" },
  ready_for_registry_visit: { label: "Ready for Registry Visit", badgeClass: "status-verified" },
  closed: { label: "Closed", badgeClass: "status-verified" },
};

const API_BASE = import.meta.env.VITE_BETTER_AUTH_URL;

export function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { data: session, isPending: sessionLoading } = useSession();

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    async function fetchIntakeRecords() {
      try {
        const res = await fetch(`${API_BASE}/citizen/intake`, {
          credentials: 'include', // sends the session cookie
        });

        if (!res.ok) {
          throw new Error('Failed to load applications');
        }

        const data = await res.json();
        setApplications(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingApps(false);
      }
    }

    if (session) {
      fetchIntakeRecords();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (sessionLoading) return <p>Loading...</p>;

  const citizenName = session?.user?.name || 'Citizen';

  // Document application cards
  const civicDocuments = [
    {
      id: "birth",
      title: "Birth Certificate",
      desc: "Apply for a new birth certificate or request a certified copy.",
      status: "Available",
      btnText: "Apply Now",
      btnType: "btn-green",
      action: () => navigate('/citizen/apply/birth')
    },
    {
        id: "national-id",
        title: "National ID Card",
        desc: "First-time registration, replacement of lost ID, or details change.",
        status: "Available",
        btnText: "Apply Now",
        btnType: "btn-green",
        action: () => navigate('/citizen/apply/id')
      },

      
      // Passports and Driver's license have been commented out for now because they are outside my current project scope
      // {
    //   id: "passport",
    //   title: "e-Passport",
    //   desc: "Ordinary or Emergency electronic passport application.",
    //   status: "Requires ID",
    //   btnText: "Check Requirements",
    //   btnType: "btn-outline",
    //   action: () => alert("Please verify your National ID record first.")
    // },
    // {
    //   id: "driver",
    //   title: "Driver's License",
    //   desc: "Provisional licence testing booking or permanent card upgrade.",
    //   status: "Available",
    //   btnText: "Apply Now",
    //   btnType: "btn-green",
    //   action: () => alert("Driver licensing module opening soon.")
    // }
  ];


  return (
    <div className="dashboard-container">
      {/* Left Dark Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">ZivaID Portal</div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <IconHome />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <IconFileText />
            <span>My Documents</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <IconClock />
            <span>Status Tracker</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <IconUser />
            <span>Profile & Security</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => navigate('/')}>
            <IconLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content Area */}
      <main className="dashboard-main">
        {/* Top Header with Flag Highlight */}
        <header className="dashboard-topbar">
          <div className="flag-bar-top">
            <span className="flag-green"></span>
            <span className="flag-yellow"></span>
            <span className="flag-red"></span>
            <span className="flag-black"></span>
          </div>

          <div className="search-container">
            <IconSearch />
            <input type="text" placeholder="Search applications, tickets, or services..." />
          </div>

          <div className="profile-badge">
            <div className="avatar-circle">{citizenName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{citizenName}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {session?.user?.nationalID
                  ? `ID: ${session.user.nationalID}`
                  : session?.user?.email}
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Welcome Context Banner */}
          <section className="welcome-banner">
            <div>
              <h1>Welcome back, {citizenName}</h1>
              <p>Select a civic service below to start a new application or track your existing ticket numbers.</p>
            </div>
            <button className="btn-card btn-green" style={{ width: 'auto', padding: '10px 20px' }}>
              {/* add icon here */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
               New Application
            </button>
          </section>

          {/* Civic Documents Grid */}
          <section>
            <h2 className="section-title">Government Document Services</h2>
            <div className="document-grid">
              {civicDocuments.map((doc) => (
                <div key={doc.id} className="doc-card">
                  <div>
                    <div className="doc-card-header">
                      <div className="doc-icon-wrap">
                        <IconFileText />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="doc-info" style={{ marginTop: '16px' }}>
                      <h3>{doc.title}</h3>
                      <p>{doc.desc}</p>
                    </div>
                  </div>
                  <button 
                    className={`btn-card ${doc.btnType}`}
                    onClick={doc.action}
                  >
                    {doc.btnText}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Application History Table */}
          <section className="table-card">
            <div className="table-header">
              <h2>Recent Applications & Status History</h2>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                {loadingApps ? 'Loading...' : `${applications.length} record(s)`}
              </span>
            </div>

            {fetchError && (
              <p style={{ color: '#b91c1c', padding: '12px 0' }}>{fetchError}</p>
            )}

            {!loadingApps && !fetchError && applications.length === 0 && (
              <p style={{ color: '#64748B', padding: '20px 0' }}>
                You haven't submitted any applications yet.
              </p>
            )}

            {!loadingApps && applications.length > 0 && (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Reference Number</th>
                    <th>Document Type</th>
                    <th>Submission Date</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((row) => {
                      const statusInfo = STATUS_DISPLAY[row.status] || {
                        label: row.status,
                        badgeClass: "status-processing",
                      };
                      return (
                        <tr key={row.id}>
                          <td style={{ fontWeight: '600' }}>{row.referenceNumber}</td>
                          <td>{DOC_TYPE_LABELS[row.documentType] || row.documentType}</td>
                          <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${statusInfo.badgeClass}`}>
                              {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                    );
              })}
              </tbody>
            </table>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default CitizenDashboard;