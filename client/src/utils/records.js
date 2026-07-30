// Shared vocabulary for intake records, mirroring app/src/db/schema.ts.
// Keep these in sync with documentTypeEnum and statusEnum on the server.

export const API_BASE = import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000';

export const DOC_TYPE_LABELS = {
  national_id: 'National ID Card',
  birth_certificate: 'Birth Certificate',
};

// The five values accepted by PATCH /admin/intakes/:referenceNumber/status
export const STATUS_OPTIONS = [
  { value: 'submitted', label: 'SUBMITTED' },
  { value: 'under_review', label: 'UNDER REVIEW' },
  { value: 'missing_information', label: 'MISSING INFORMATION' },
  { value: 'ready_for_registry_visit', label: 'READY FOR REGISTRY VISIT' },
  { value: 'closed', label: 'CLOSED' },
];

export const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  missing_information: 'Missing Information',
  ready_for_registry_visit: 'Ready for Registry Visit',
  closed: 'Closed',
};

// Badge palette keyed on the real enum values (not pending/verified/rejected).
export const STATUS_COLORS = {
  submitted: { background: '#E0F2FE', color: '#0369A1' },
  under_review: { background: '#FEF3C7', color: '#92400E' },
  missing_information: { background: '#FEE2E2', color: '#991B1B' },
  ready_for_registry_visit: { background: '#DCFCE7', color: '#166534' },
  closed: { background: '#F1F5F9', color: '#475569' },
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || 'Unknown';
}

export function statusColor(status) {
  return STATUS_COLORS[status] || { background: '#F1F5F9', color: '#475569' };
}

export function docTypeLabel(documentType) {
  return DOC_TYPE_LABELS[documentType] || documentType || 'Unknown';
}

export function submissionTier(record) {
  return record?.isAdminAssisted ? 'Assisted Citizen' : 'Self-Service';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}
