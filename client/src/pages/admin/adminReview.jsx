// src/pages/admin/AdminReview.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../lib/auth-client';
import {
  API_BASE,
  STATUS_OPTIONS,
  statusLabel,
  statusColor,
  docTypeLabel,
  submissionTier,
  formatDateTime,
} from '../../utils/records';
import { ZIM_DISTRICTS } from '../../utils/zimDistricts';
import '../../assets/admin.css';

// districtCode is stored as the bare two-digit registry code, so resolve it to
// a name for display — the code on its own means nothing to an officer.
function districtLabel(code) {
  if (!code) return '—';
  const district = ZIM_DISTRICTS.find((d) => d.code === code);
  return district ? `${code} (${district.name})` : code;
}

export function AdminReview() {

  const { recordId: referenceNumber } = useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const officerName = session?.user?.name || 'Officer';
  const officerEmail = session?.user?.email || '—';
  const officerInitials = officerName.slice(0, 2).toUpperCase();

  const [record, setRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [newStatus, setNewStatus] = useState('');
  const [officerComment, setOfficerComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This reloadKey would allow us to Re-run the fetch below, so the badge and the audit timeline reflect what was just written.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function loadRecord() {
      setFetchError('');
      try {
        const res = await fetch(
          `${API_BASE}/admin/intakes/${encodeURIComponent(referenceNumber)}`,
          { credentials: 'include' } // sends the officer's session cookie
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load this intake record.');
        }

        const data = await res.json();
        setRecord(data);
        setNewStatus(data.status);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingRecord(false);
      }
    }

    loadRecord();
  }, [referenceNumber, reloadKey]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    // The server enforces a 3-character minimum, so mirror it here rather than
    // letting a validation rejection come back as a generic failure.
    if (officerComment.trim().length < 3) {
      alert("Validation Error: Please provide an official review remark or reason before updating status.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE}/admin/intakes/${encodeURIComponent(record.referenceNumber)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            newStatus: newStatus,
            comment: officerComment,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update record status");
      }

      const data = await res.json();
      alert(data.message);

      setOfficerComment("");
      setReloadKey((key) => key + 1);
    } catch (err) {
      alert(`System Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRecord) return <p style={{ padding: '40px' }}>Loading record…</p>;

  if (fetchError || !record) {
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ color: '#B91C1C', fontWeight: '600' }}>
          {fetchError || 'Intake record not found.'}
        </p>
        <button className="btn-action" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Review Queue
        </button>
      </div>
    );
  }

  const badge = statusColor(record.status);
  const details = record.details || {};
  const checklist = record.checklist || [];
  const auditHistory = record.auditHistory || [];

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
            <div className="admin-avatar">{officerInitials}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{officerName}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>{officerEmail}</div>
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/*  Citizen Application Data & Document Checklist */}
          <div>
            <section className="admin-card">
              <div className="admin-card-header">
                <h2>Applicant Core Details ({docTypeLabel(record.documentType)})</h2>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  background: badge.background,
                  color: badge.color
                }}>
                  Current Status: {statusLabel(record.status)}
                </span>
              </div>
                <div className="admin-card-content" style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>FULL LEGAL NAME</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '700', fontSize: '16px' }}>{record.fullName}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>DATE OF BIRTH</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{record.dateOfBirth}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>GENDER</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{record.gender || '—'}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>PLACE OF ORIGIN</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{record.placeOfOrigin || '—'}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>DISTRICT OF ORIGIN</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{districtLabel(record.districtCode)}</p>
                        </div>
                        <div>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>SUBMISSION TIER</label>
                        <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{submissionTier(record)}</p>
                        </div>
                    </div>
                </div>

              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '20px 0' }} />

              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px' }}>Submitted Additional Information</h3>
              {Object.keys(details).length === 0 && (
                <p style={{ color: '#64748B', fontSize: '13px' }}>
                  No additional information was submitted with this record.
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.entries(details).map(([key, val]) => (
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
                {checklist.length === 0 && (
                  <p style={{ color: '#64748B', fontSize: '13px' }}>
                    No checklist items were captured for this record.
                  </p>
                )}

                {checklist.map((item, index) => (
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
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
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
                {auditHistory.length === 0 && (
                  <p style={{ color: '#64748B', fontSize: '13px' }}>
                    No status changes have been logged against this record yet.
                  </p>
                )}

                {auditHistory.map((log) => (
                  <div key={log.id} style={{
                    borderLeft: '3px solid #0F172A',
                    paddingLeft: '12px',
                    fontSize: '12px'
                  }}>
                    <div style={{ color: '#64748B', fontWeight: '600' }}>{formatDateTime(log.createdAt)}</div>
                    <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                      [{statusLabel(log.newStatus).toUpperCase()}] by {log.changedBy || 'Unknown officer'}
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#334155' }}>{log.comment || '—'}</p>
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