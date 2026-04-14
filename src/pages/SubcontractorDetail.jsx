import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/shared/Toast';
import {
  getComplianceStatus,
  getDaysUntilExpiration,
  getExpirationLabel,
  formatDate,
  formatCurrency,
  formatPhone,
  getCertStatus,
} from '../utils/compliance';
import StatusBadge from '../components/shared/StatusBadge';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  AlertTriangle,
  Send,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Hash,
} from 'lucide-react';

const TABS = ['overview', 'certificates', 'documents', 'activity'];

export default function SubcontractorDetail() {
  const { id } = useParams();
  const { subcontractors, getCertsForSub, getAgentForSub, getW9ForSub, generalContractors, gcSubs, addVerification, logEmail, addNotification } = useData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const sub = subcontractors.find(s => s.id === parseInt(id));
  const certs = useMemo(() => sub ? getCertsForSub(sub.id) : [], [sub, getCertsForSub]);
  const agent = useMemo(() => sub ? getAgentForSub(sub.id) : null, [sub, getAgentForSub]);
  const w9 = useMemo(() => sub ? getW9ForSub(sub.id) : null, [sub, getW9ForSub]);
  const status = useMemo(() => sub ? getComplianceStatus(sub.id) : 'red', [sub]);

  const linkedGCs = useMemo(() => {
    if (!sub) return [];
    const gcIds = gcSubs.filter(gs => gs.subcontractor_id === sub.id).map(gs => gs.gc_id);
    return generalContractors.filter(gc => gcIds.includes(gc.id));
  }, [sub, gcSubs, generalContractors]);

  const glCert = certs.find(c => c.type === 'gl');
  const wcCert = certs.find(c => c.type === 'wc');

  const handleRequestCert = () => {
    if (!agent || !sub) return;
    addVerification({ subcontractor_id: sub.id, agent_id: agent.id, gc_id: linkedGCs[0]?.id, type: 'certificate_request' });
    logEmail({ to_email: agent.email, subject: `Certificate Request — ${sub.company_name}`, template: 'certificate_request', status: 'delivered' });
    addToast(`Certificate request sent to ${agent.name}`, 'success');
  };

  const handleVerify = () => {
    if (!agent || !sub) return;
    addVerification({ subcontractor_id: sub.id, agent_id: agent.id, gc_id: linkedGCs[0]?.id, type: 'verification' });
    logEmail({ to_email: agent.email, subject: `Policy Verification — ${sub.company_name}`, template: 'verification', status: 'delivered' });
    addToast(`Verification request sent to ${agent.name}`, 'success');
  };

  if (!sub) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Subcontractor not found</p>
        <Link to="/subcontractors" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Back to subcontractors</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/subcontractors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Subcontractors
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{sub.company_name}</h1>
              <StatusBadge status={status} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{sub.contact_name}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{sub.trade}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{sub.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{formatPhone(sub.phone)}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sub.address}</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />EIN: {sub.ein}</span>
              <span>{sub.entity_type}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleRequestCert}
              disabled={!agent}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" /> Request Certs
            </button>
            <button
              onClick={handleVerify}
              disabled={!agent}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Shield className="w-4 h-4" /> Verify
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <CertCard title="General Liability" cert={glCert} />
          <CertCard title="Workers Compensation" cert={wcCert} />
          {agent && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3">Insurance Agent</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{agent.name}</p>
                  <p className="text-sm text-gray-500">{agent.agency}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{agent.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{formatPhone(agent.phone)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">Linked General Contractors</h3>
            <div className="flex flex-wrap gap-2">
              {linkedGCs.map(gc => (
                <Link
                  key={gc.id}
                  to={`/contractors/${gc.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {gc.company_name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {certs.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">No certificates on file</p>
          ) : (
            certs.map(cert => <CertDetailCard key={cert.id} cert={cert} />)
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">W-9 Documents</h3>
          {w9 ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{w9.file_name}</p>
                <p className="text-xs text-gray-500">Tax Year: {w9.tax_year} | Uploaded: {formatDate(w9.uploaded_at)}</p>
                <span className={`text-xs font-medium ${w9.status === 'current' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {w9.status === 'current' ? 'Current' : 'Expired — Renewal Needed'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No W-9 on file</p>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            <TimelineItem
              icon={CheckCircle}
              iconColor="text-emerald-500"
              title="Subcontractor added"
              date={sub.created_at}
            />
            {certs.map(cert => (
              <TimelineItem
                key={cert.id}
                icon={FileText}
                iconColor="text-blue-500"
                title={`${cert.type.toUpperCase()} certificate uploaded — ${cert.carrier}`}
                date={cert.created_at}
              />
            ))}
            {certs.filter(c => c.verified).map(cert => (
              <TimelineItem
                key={`v-${cert.id}`}
                icon={Shield}
                iconColor="text-emerald-500"
                title={`${cert.type.toUpperCase()} certificate verified`}
                date={cert.verified_at}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CertCard({ title, cert }) {
  if (!cert) {
    return (
      <div className="bg-white rounded-xl border border-red-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <StatusBadge status="red" size="sm" />
        </div>
        <p className="text-sm text-gray-400">No certificate on file</p>
      </div>
    );
  }

  const days = getDaysUntilExpiration(cert.expiration_date);
  const certStatus = getCertStatus(cert);

  return (
    <div className={`bg-white rounded-xl border p-5 ${certStatus === 'red' ? 'border-red-100' : certStatus === 'yellow' ? 'border-amber-100' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <StatusBadge status={certStatus} size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400">Policy #</p>
          <p className="font-medium text-gray-900">{cert.policy_number}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Carrier</p>
          <p className="font-medium text-gray-900">{cert.carrier}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Effective</p>
          <p className="text-gray-700">{formatDate(cert.effective_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Expiration</p>
          <p className={`font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-700'}`}>
            {formatDate(cert.expiration_date)}
          </p>
          <p className={`text-xs ${days < 0 ? 'text-red-500' : days <= 30 ? 'text-amber-500' : 'text-gray-400'}`}>
            {getExpirationLabel(cert.expiration_date)}
          </p>
        </div>
        {cert.type === 'gl' && (
          <>
            <div>
              <p className="text-xs text-gray-400">Per Occurrence</p>
              <p className="text-gray-700">{formatCurrency(cert.per_occurrence_limit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Aggregate</p>
              <p className="text-gray-700">{formatCurrency(cert.aggregate_limit)}</p>
            </div>
          </>
        )}
      </div>
      {cert.ghost_policy_flag && (
        <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 text-xs">
          <AlertTriangle className="w-4 h-4" /> Potential ghost policy — review recommended
        </div>
      )}
    </div>
  );
}

function CertDetailCard({ cert }) {
  const days = getDaysUntilExpiration(cert.expiration_date);
  const certStatus = getCertStatus(cert);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900">{cert.type === 'gl' ? 'General Liability' : 'Workers Compensation'}</h3>
            <p className="text-xs text-gray-500">{cert.file_name}</p>
          </div>
        </div>
        <StatusBadge status={certStatus} size="sm" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div><p className="text-xs text-gray-400">Policy #</p><p className="font-medium">{cert.policy_number}</p></div>
        <div><p className="text-xs text-gray-400">Carrier</p><p className="font-medium">{cert.carrier}</p></div>
        <div><p className="text-xs text-gray-400">Effective</p><p>{formatDate(cert.effective_date)}</p></div>
        <div>
          <p className="text-xs text-gray-400">Expiration</p>
          <p className={days < 0 ? 'text-red-600 font-medium' : days <= 30 ? 'text-amber-600' : ''}>{formatDate(cert.expiration_date)}</p>
        </div>
        {cert.type === 'gl' && (
          <>
            <div><p className="text-xs text-gray-400">Per Occurrence</p><p>{formatCurrency(cert.per_occurrence_limit)}</p></div>
            <div><p className="text-xs text-gray-400">Aggregate</p><p>{formatCurrency(cert.aggregate_limit)}</p></div>
            <div><p className="text-xs text-gray-400">Additional Insured</p><p>{cert.additional_insured ? 'Yes' : 'No'}</p></div>
            <div><p className="text-xs text-gray-400">Waiver of Subrogation</p><p>{cert.waiver_of_subrogation ? 'Yes' : 'No'}</p></div>
          </>
        )}
        {cert.type === 'wc' && (
          <>
            <div><p className="text-xs text-gray-400">EL Each Accident</p><p>{formatCurrency(cert.employers_liability_each)}</p></div>
            <div><p className="text-xs text-gray-400">EL Policy Limit</p><p>{formatCurrency(cert.employers_liability_policy)}</p></div>
          </>
        )}
        <div><p className="text-xs text-gray-400">Verified</p><p>{cert.verified ? formatDate(cert.verified_at) : 'Not verified'}</p></div>
        <div><p className="text-xs text-gray-400">Uploaded by Agent</p><p>{cert.uploaded_by_agent ? 'Yes' : 'No'}</p></div>
      </div>
      {cert.ghost_policy_flag && (
        <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 text-xs">
          <AlertTriangle className="w-4 h-4" /> Ghost policy flag
        </div>
      )}
    </div>
  );
}

function TimelineItem({ icon: Icon, iconColor, title, date }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-400">{formatDate(date)}</p>
      </div>
    </div>
  );
}
