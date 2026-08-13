// src/pages/admin/AdminReview.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../assets/admin.css';

export function AdminReview() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const officerName = "Officer P. Kunze";
  const officerId = "RG-HARARE-042";

  // Mock data
  const [record, setRecord] = useState({
    referenceNumber: recordId || "ZIV-2026-8841",
    citizen: "Mufaro Moyo",
    dateOfBirth: "2008-04-14",
    gender: "Female",
    placeOfOrigin: "Sally Mugabe Central Hospital, Harare",
    nationalId: "63-2345678-F-42",
    docType: "Birth Certificate",
    submittedDate: "2026-07-28",
    status: "under_review",
    type: "Self-Service",
    districtCode: "63 (Harare Metropolitan)",

    details: {
      motherName: "Chipo Moyo",
      motherMaidenName: "Ndlovu",
      motherIdNumber: "63-9988776-Z-12",
      fatherName: "Not Acknowledged / Single Application",
      hospitalOfBirth: "Sally Mugabe Central Hospital"
    },
    
    checklist: [
      { itemLabel: "Notification of Birth from hospital/clinic", isAvailable: true },
      { itemLabel: "Mother's national ID card (Original + Certified Copy)", isAvailable: true },
      { itemLabel: "Father's national ID card (if applicable)", isAvailable: false },
      { itemLabel: "Marriage certificate (if parents are married)", isAvailable: false }
    ]
  });

  const [newStatus, setNewStatus] = useState(record.status);
  const [officerComment, setOfficerComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditHistory, setAuditHistory] = useState([
    {
      timestamp: "28 Jul 2026, 10:15 AM",
      action: "SUBMITTED",
      user: "Citizen Self-Service Portal",
      notes: "Intake form completed and reference ticket generated."
    }
  ]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!officerComment.trim()) {
      alert("Validation Error: Please provide an official review remark or reason before updating status.");
      return;
    }

    setIsSubmitting(true);

    try {
    const res = await fetch(`http://localhost:3000/admin/intakes/${record.referenceNumber}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        newStatus: newStatus,
        comment: officerComment,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update record status");
    }

    const data = await res.json();
    alert(data.message);
    
    // Refresh the local UI state after successful DB update
    window.location.reload(); 
  } catch (err) {
    alert(`System Error: ${err.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="admin-container">
      {/* Dark Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">Registrar General</div>
          <div className="admin-badge-label">ZivaID Officer Portal</div>
        </div>
        <nav className="admin-nav">
          <button className="admin-nav-item" onClick={() => navigate('/admin/dashboard')}>
            <span>← Back to Review Queue</span>
          </button>
        </nav>
      </aside>

      {/* Main Review Area */}
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
            Document Inspection & Adjudication: {record.referenceNumber}
          </div>
          <div className="admin-profile-badge">
            <div className="admin-avatar">PK</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{officerName}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Station: {officerId}</div>
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/*  Citizen Application Data & Document Checklist */}
          <div>
            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Applicant Core Details ({record.docType})</h2>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  background: record.status === 'verified' ? '#DCFCE7' : record.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                  color: record.status === 'verified' ? '#166534' : record.status === 'rejected' ? '#991B1B' : '#92400E'
                }}>
                  Current Status: {record.status}
                </span>
              </div>
                <div className="admin-card-content" style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>FULL LEGAL NAME</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '700', fontSize: '16px' }}>{record.citizen}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>DATE OF BIRTH</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{record.dateOfBirth}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>DISTRICT OF ORIGIN</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{record.districtCode}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>SUBMISSION TIER</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{record.type}</p>
                        </div>
                    </div>
                </div>

              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '20px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px' }}>Submitted Additional Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.entries(record.details).map(([key, val]) => (
                  <div key={key} style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginTop: '2px' }}>
                      {val || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '24px 0 12px' }}>Verified Physical Checklist</h3>
              <div>
                {record.checklist.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    background: item.isAvailable ? '#F0FDF4' : '#F8FAFC'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.itemLabel}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: item.isAvailable ? '#166534' : '#94A3B8'
                    }}>
                      {item.isAvailable ? '✓ PRESENT' : '× NOT PROVIDED'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Form & Status Audit Trail */}
          <div>
            <section className="admin-card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>Adjudication Action</h3>
              <form onSubmit={handleStatusUpdate}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    UPDATE VERIFICATION STATUS
                  </label>
                  <select
                    className="filter-select"
                    style={{ width: "100%" }}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    >
                    <option value="submitted">SUBMITTED</option>
                    <option value="under_review">UNDER REVIEW</option>
                    <option value="missing_information">MISSING INFORMATION</option>
                    <option value="ready_for_registry_visit">READY FOR REGISTRY VISIT</option>
                    <option value="closed">CLOSED</option>
                    </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    OFFICER REMARKS / REJECTION REASON *
                  </label>
                  <textarea
                    rows="4"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Provide reasons for verification approval, discrepancy notes, or missing documents..."
                    value={officerComment}
                    onChange={(e) => setOfficerComment(e.target.value)}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    * Remarks are permanently logged in the ZivaID audit schema.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit-intake"
                  style={{ width: '100%', background: '#0F172A' }}
                >
                  {isSubmitting ? 'Logging to Database...' : 'Stamp Status & Log Remark'}
                </button>
              </form>
            </section>

            {/* Status Log Timeline */}
            <section className="admin-card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px' }}>Immutable Audit History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditHistory.map((log, index) => (
                  <div key={index} style={{
                    borderLeft: '3px solid #0F172A',
                    paddingLeft: '12px',
                    fontSize: '12px'
                  }}>
                    <div style={{ color: '#64748B', fontWeight: '600' }}>{log.timestamp}</div>
                    <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                      [{log.action}] by {log.user}
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#334155' }}>{log.notes}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReview;