import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ZIM_DISTRICTS } from '../../utils/zimDistricts';
import MultilingualLabel from '../../components/MultilingualLabel';
import { multilingualLabels as L } from '../../constants/multilingualLabels';
import { API_BASE } from '../../utils/records';
import '../../assets/dashboard.css';

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
      { key: 'motherName', labels: L.motherFullName, required: true },
      { key: 'motherMaidenName', labels: L.motherMaidenName, required: true },
      {
        key: 'motherIdNumber',
        labels: L.motherNationalId,
        hint: 'Format: XX-XXXXXX X XX',
        required: true,
      },
      { key: 'fatherName', labels: L.fatherFullName, hint: 'Optional if unacknowledged' },
      { key: 'fatherIdNumber', labels: L.fatherNationalId, hint: 'Optional' },
      { key: 'hospitalOfBirth', labels: L.hospitalOfBirth, required: true },
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
      {
        key: 'birthEntryNumber',
        labels: L.birthCertificateEntryNumber,
        hint: 'e.g. HRE-102938/2008',
        required: true,
      },
      {
        key: 'applicationReason',
        labels: L.applicationReason,
        hint: 'First-Time / Replacement / Marriage Change',
        required: true,
      },
      { key: 'guardianName', labels: L.guardianName, hint: 'If the applicant is under 18' },
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
        <h2 className="section-title">
          {L.personalDetails.en}
          <span className="section-title-translations" aria-hidden="true">
            {L.personalDetails.sn} · {L.personalDetails.nd}
          </span>
        </h2>

        <div className="form-group">
          <MultilingualLabel htmlFor="fullName" labels={L.fullName} required />
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <MultilingualLabel htmlFor="dateOfBirth" labels={L.dateOfBirth} required />
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <MultilingualLabel htmlFor="gender" labels={L.gender} required />
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">{L.selectOption.en}</option>
            <option value="male">
              {L.male.en} / {L.male.sn} / {L.male.nd}
            </option>
            <option value="female">
              {L.female.en} / {L.female.sn} / {L.female.nd}
            </option>
          </select>
        </div>

        <div className="form-group">
          <MultilingualLabel htmlFor="districtCode" labels={L.districtOfRegistration} required />
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
          <MultilingualLabel htmlFor="placeOfOrigin" labels={L.placeOfOrigin} required />
          <input
            id="placeOfOrigin"
            type="text"
            value={placeOfOrigin}
            onChange={(e) => setPlaceOfOrigin(e.target.value)}
            placeholder="e.g. Sally Mugabe Hospital, Harare"
            required
          />
          <small style={{ color: '#64748B' }}>City, village, or facility.</small>
        </div>

        <h2 className="section-title">
          {L.additionalDetails.en}
          <span className="section-title-translations" aria-hidden="true">
            {L.additionalDetails.sn} · {L.additionalDetails.nd}
          </span>
        </h2>
        {config.detailsFields.map((field) => (
          <div className="form-group" key={field.key}>
            <MultilingualLabel
              htmlFor={field.key}
              labels={field.labels}
              required={field.required || false}
            />
            <input
              id={field.key}
              type="text"
              value={details[field.key] || ''}
              onChange={(e) => handleDetailChange(field.key, e.target.value)}
              required={field.required || false}
            />
            {field.hint && <small style={{ color: '#64748B' }}>{field.hint}</small>}
          </div>
        ))}

        <h2 className="section-title">
          {L.documentChecklist.en}
          <span className="section-title-translations" aria-hidden="true">
            {L.documentChecklist.sn} · {L.documentChecklist.nd}
          </span>
        </h2>
        <p style={{ color: '#64748B', marginBottom: '4px' }}>
          {L.iHaveThisDocument.en}
          <span className="label-translations" style={{ display: 'block' }} aria-hidden="true">
            {L.iHaveThisDocument.sn} · {L.iHaveThisDocument.nd}
          </span>
        </p>
        <p style={{ color: '#64748B', marginBottom: '12px' }}>
          Don't worry if something is missing — you can still submit, and an officer will guide you
          on what's needed.
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