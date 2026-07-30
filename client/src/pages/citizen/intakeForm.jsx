import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ZIM_DISTRICTS } from '../../utils/zimDistricts'; 
import '../../assets/dashboard.css';

const API_BASE = import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000';

const DOC_TYPE_MAP = {
  birth: 'birth_certificate',
  id: 'national_id',
};

const PAGE_CONFIG = {
  birth_certificate: {
    title: 'Birth Certificate Application',
    checklist: [
      'Notification of Birth from hospital/clinic (or witness affidavit for home births)',
      "Mother's national ID card (Original + Certified Copy)",
      "Father's national ID card (if applicable)",
      'Marriage certificate (if parents are married)',
    ],
    detailsFields: [
      { key: 'motherName', label: "Mother's Full Name", required: true },
      { key: 'motherMaidenName', label: "Mother's Maiden Name", required: true },
      { key: 'motherIdNumber', label: "Mother's National ID (XX-XXXXXX X XX)", required: true },
      { key: 'fatherName', label: "Father's Full Name (Optional if unacknowledged)" },
      { key: 'fatherIdNumber', label: "Father's National ID (Optional)" },
      { key: 'hospitalOfBirth', label: 'Hospital / Clinic of Birth', required: true },
    ],
  },
  national_id: {
    title: 'National ID Application',
    checklist: [
      'Original Long Birth Certificate',
      'Two (2) Passport-Sized Photographs',
      "Parent's or guardian's national ID card",
      'Police Report / Stamped Affidavit (Required if replacing Lost/Damaged ID)',
      'Marriage certificate (if changing surname after marriage)',
    ],
    detailsFields: [
      { key: 'birthEntryNumber', label: 'Birth Certificate Entry Number (e.g. HRE-102938/2008)', required: true },
      { key: 'applicationReason', label: 'Application Reason (First-Time / Replacement / Marriage Change)', required: true },
      { key: 'guardianName', label: 'Accompanying Parent/Guardian Name (if under 18)' },
    ],
  },
};

export function IntakeForm() {
  const { docType } = useParams();
  const navigate = useNavigate();
  const documentType = DOC_TYPE_MAP[docType];
  const config = PAGE_CONFIG[documentType];

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [placeOfOrigin, setPlaceOfOrigin] = useState('');
  const [details, setDetails] = useState({});
  const [checklist, setChecklist] = useState(
    config ? config.checklist.map((label) => ({ itemLabel: label, isAvailable: false })) : []
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!config) {
    return (
      <div className="dashboard-content">
        <p>Unknown document type.</p>
        <Link to="/citizen/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  const toggleChecklistItem = (index) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleDetailChange = (key, value) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

//   Validate 16+ age requirement for National ID
  const isEligibleForID = (dob) => {
    if (!dob || documentType !== 'national_id') return true;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 16;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEligibleForID(dateOfBirth)) {
      setError('Eligibility Error: Zimbabwean citizens must be at least 16 years old to apply for a National ID.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/citizen/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          documentType,
          fullName,
          dateOfBirth,
          gender,
          districtCode,
          placeOfOrigin,
          details,
          checklist,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed. Please try again.');
      }

      const record = await res.json();
      setResult(record);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Success screen (SRS section 3.1) ---
  if (result) {
    return (
      <div className="dashboard-content">
        <section className="welcome-banner">
          <div>
            <h1>Application Submitted</h1>
            <p>Your reference number is below. Keep it safe — you'll use it to track your application's status.</p>
          </div>
        </section>
        <section className="table-card">
          <p style={{ fontSize: '20px', fontWeight: '700', margin: '20px 0' }}>
            {result.referenceNumber}
          </p>
          <button
            className="btn-card btn-green"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => navigate('/citizen/dashboard')}
          >
            Return to Dashboard
          </button>
        </section>
      </div>
    );
  }

  // --- Form screen ---
  return (
    <div className="dashboard-content">
      <section className="welcome-banner">
        <div>
          <h1>{config.title}</h1>
          <p>Fill in your details and confirm which supporting documents you have available.</p>
        </div>
      </section>

      {error && <p className="auth-error" style={{ color: '#CE1126', fontWeight: 600 }}>{error}</p>}

      <form onSubmit={handleSubmit} className="table-card">
        <h2 className="section-title">Personal Details</h2>

        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="districtCode">District of Registration (Official Province Code)</label>
          <select
            id="districtCode"
            value={districtCode}
            onChange={(e) => setDistrictCode(e.target.value)}
            required
          >
            <option value="">-- Select District Code --</option>
            {ZIM_DISTRICTS.map((dist, idx) => (
              <option key={idx} value={dist.code}>
                Code {dist.code} — {dist.name} ({dist.province})
              </option>
            ))}
          </select>
          <small style={{ color: '#64748B' }}>
            This two-digit code forms the prefix of a Zimbabwe National ID (e.g., 63 for Harare).
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="placeOfOrigin">Place of Origin (City/Village/Facility)</label>
          <input
            id="placeOfOrigin"
            type="text"
            value={placeOfOrigin}
            onChange={(e) => setPlaceOfOrigin(e.target.value)}
            placeholder="e.g. Sally Mugabe Hospital, Harare"
            required
          />
        </div>

        <h2 className="section-title">Additional Details</h2>
        {config.detailsFields.map((field) => (
          <div className="form-group" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              type="text"
              value={details[field.key] || ''}
              onChange={(e) => handleDetailChange(field.key, e.target.value)}
              required={field.required || false}
            />
          </div>
        ))}

        <h2 className="section-title">Document Checklist</h2>
        <p style={{ color: '#64748B', marginBottom: '12px' }}>
          Tick the documents you currently have available. Don't worry if something is missing —
          you can still submit, and an officer will guide you on what's needed.
        </p>
        {checklist.map((item, index) => (
          <label
            key={item.itemLabel}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}
          >
            <input
              type="checkbox"
              checked={item.isAvailable}
              onChange={() => toggleChecklistItem(index)}
            />
            {item.itemLabel}
          </label>
        ))}

        <button type="submit" className="btn-card btn-green" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default IntakeForm;