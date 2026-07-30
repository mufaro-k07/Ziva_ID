import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../../lib/auth-client';
import '../../assets/dashboard.css';

/* Including Icons*/
const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const IconLogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
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

const API_BASE = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000"; 

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

  const scrollToSection = (id, tabName) => {
    setActiveTab(tabName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (sessionLoading) return <p style={{ padding: '40px' }}>Loading...</p>;

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
            onClick={() => scrollToSection('overview', 'overview')}
          >
            <IconHome />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => scrollToSection('applications', 'applications')}
          >
            <IconFileText />
            <span>My Documents</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => scrollToSection('history', 'history')}
          >
            <IconClock />
            <span>Status Tracker</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => scrollToSection('profile', 'profile')}
          >
            <IconUser />
            <span>Profile & Security</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleSignOut}>
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
            <button 
              className="btn-card btn-green" 
              style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => scrollToSection('applications', 'applications')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
               New Application
            </button>
          </section>

          {/* Civic Documents Grid */}
          <section id="applications">
            <h2 className="section-title">Government Document Services</h2>
            <div className="document-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {civicDocuments.map((doc) => (
                <div key={doc.id} className="table-card doc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                  <div>
                    <div className="doc-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="doc-icon-wrap" style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px' }}>
                        <IconFileText />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="doc-info" style={{ marginTop: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{doc.title}</h3>
                      <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.5' }}>{doc.desc}</p>
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
          <section id="history" className="table-card">
            <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Applications & Status History</h2>
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
              <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 0' }}>Reference Number</th>
                    <th style={{ padding: '12px 0' }}>Document Type</th>
                    <th style={{ padding: '12px 0' }}>Submission Date</th>
                    <th style={{ padding: '12px 0' }}>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((row) => {
                      const statusInfo = STATUS_DISPLAY[row.status] || {
                        label: row.status,
                        badgeClass: "status-processing",
                      };
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ fontWeight: '600', padding: '16px 0' }}>{row.referenceNumber}</td>
                          <td style={{ padding: '16px 0' }}>{DOC_TYPE_LABELS[row.documentType] || row.documentType}</td>
                          <td style={{ padding: '16px 0' }}>{new Date(row.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '16px 0' }}>
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

          {/* Profile Security Section */}
          <section id="profile" className="table-card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Profile Security</h2>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Your account is currently protected. To update your National ID registration linkage or change authentication credentials, please visit your nearest Civil Registry office.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CitizenDashboard;