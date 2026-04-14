import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';
import { certificates, gcSubcontractors, subAgentAssignments, insuranceAgents } from '../data/mockData';

const TODAY = new Date();

export function getComplianceStatus(subcontractorId, gc = null) {
  const subCerts = certificates.filter(c => c.subcontractor_id === subcontractorId);
  const glCert = subCerts.find(c => c.type === 'gl');
  const wcCert = subCerts.find(c => c.type === 'wc');

  const glStatus = getCertStatus(glCert, gc);
  const wcStatus = getCertStatus(wcCert, gc);

  if (glStatus === 'red' || wcStatus === 'red') return 'red';
  if (glStatus === 'yellow' || wcStatus === 'yellow') return 'yellow';
  return 'green';
}

export function getCertStatus(cert, gc = null) {
  if (!cert) return 'red';

  const expDate = parseISO(cert.expiration_date);

  if (isBefore(expDate, TODAY)) return 'red';

  const daysUntilExp = differenceInDays(expDate, TODAY);
  if (daysUntilExp <= 30) return 'yellow';

  if (cert.ghost_policy_flag) return 'yellow';

  if (cert.type === 'gl' && gc) {
    if (cert.per_occurrence_limit < (gc.gl_minimum_per_occurrence || 1000000)) return 'yellow';
    if (cert.aggregate_limit < (gc.gl_minimum_aggregate || 2000000)) return 'yellow';
  }

  if (!cert.verified) return 'yellow';

  return 'green';
}

export function getDaysUntilExpiration(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), TODAY);
}

export function getExpirationLabel(dateStr) {
  const days = getDaysUntilExpiration(dateStr);
  if (days === null) return 'No date';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  return `${days}d remaining`;
}

export function getSubCertsForGC(gcId) {
  const subIds = gcSubcontractors
    .filter(gs => gs.gc_id === gcId)
    .map(gs => gs.subcontractor_id);

  return subIds.map(subId => {
    const subCerts = certificates.filter(c => c.subcontractor_id === subId);
    return { subcontractorId: subId, certs: subCerts };
  });
}

export function getComplianceStats(gcId) {
  const subIds = gcSubcontractors
    .filter(gs => gs.gc_id === gcId)
    .map(gs => gs.subcontractor_id);

  let green = 0, yellow = 0, red = 0;
  subIds.forEach(id => {
    const status = getComplianceStatus(id);
    if (status === 'green') green++;
    else if (status === 'yellow') yellow++;
    else red++;
  });

  const total = subIds.length;
  const complianceRate = total > 0 ? Math.round((green / total) * 100) : 0;

  return { green, yellow, red, total, complianceRate };
}

export function getAgentForSub(subcontractorId) {
  const assignment = subAgentAssignments.find(a => a.subcontractor_id === subcontractorId);
  if (!assignment) return null;
  return insuranceAgents.find(a => a.id === assignment.agent_id) || null;
}

export function getSubsForGC(gcId) {
  return gcSubcontractors
    .filter(gs => gs.gc_id === gcId)
    .map(gs => gs.subcontractor_id);
}

export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseISO(dateStr));
}

export function formatPhone(phone) {
  return phone || '—';
}

export const STATUS_CONFIG = {
  green: { label: 'Compliant', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  yellow: { label: 'At Risk', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  red: { label: 'Non-Compliant', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};
