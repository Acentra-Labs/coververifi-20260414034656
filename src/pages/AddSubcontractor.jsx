import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/shared/Toast';
import { validateSubcontractorForm, validateAgentForm, validateRequired } from '../utils/validators';
import {
  Building2,
  FileText,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
} from 'lucide-react';

const STEPS = [
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'w9', label: 'W-9', icon: FileText },
  { id: 'agent', label: 'Agent', icon: User },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

const TRADES = [
  'Electrical', 'Plumbing', 'HVAC', 'Concrete / Foundation', 'Framing',
  'Roofing', 'Drywall', 'Painting', 'Tile & Flooring', 'Excavation',
  'Landscaping', 'Masonry', 'Insulation', 'Fire Protection', 'Other',
];

const ENTITY_TYPES = ['LLC', 'Corporation', 'S-Corp', 'Sole Proprietor', 'Partnership'];

export default function AddSubcontractor() {
  const { user } = useAuth();
  const { addSubcontractor, generalContractors, subcontractors } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const [companyData, setCompanyData] = useState({
    company_name: '', contact_name: '', email: '', phone: '', address: '',
    ein: '', entity_type: '', trade: '',
  });
  const [w9Data, setW9Data] = useState({ file: null, fileName: '' });
  const [agentData, setAgentData] = useState({ name: '', agency: '', email: '', phone: '' });
  const [selectedGcId, setSelectedGcId] = useState(
    user?.role === 'gc' ? user.gc_id : generalContractors[0]?.id || ''
  );

  const availableGCs = user?.role === 'consultant'
    ? generalContractors.filter(gc => gc.consultant_id === user.consultant_id)
    : [];

  const handleCompanyChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleAgentChange = (field, value) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [`agent_${field}`]: undefined }));
  };

  const handleW9Upload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setW9Data({ file, fileName: file.name });
    }
  };

  const validateStep = () => {
    if (step === 0) {
      const { valid, errors: companyErrors } = validateSubcontractorForm(companyData);
      const tradeErr = validateRequired(companyData.trade, 'Trade');
      if (tradeErr) companyErrors.trade = tradeErr;

      const duplicate = subcontractors.find(s =>
        s.company_name.toLowerCase() === companyData.company_name.toLowerCase() ||
        (companyData.ein && s.ein === companyData.ein)
      );
      if (duplicate) companyErrors.duplicate = `"${duplicate.company_name}" already exists in the system`;

      if (!valid || Object.keys(companyErrors).length > 0) {
        setErrors(companyErrors);
        return false;
      }
    }
    if (step === 2) {
      const { valid, errors: agentErrors } = validateAgentForm(agentData);
      if (!valid) {
        const mapped = {};
        Object.entries(agentErrors).forEach(([k, v]) => { mapped[`agent_${k}`] = v; });
        setErrors(mapped);
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const newSub = addSubcontractor(companyData, parseInt(selectedGcId));
    addToast(`${companyData.company_name} added successfully!`, 'success');
    navigate(`/subcontractors/${newSub.id}`);
  };

  const inputClasses = (field) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${
      errors[field] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Subcontractor</h1>
        <p className="text-sm text-gray-500 mt-1">Complete the wizard to onboard a new subcontractor</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              i === step ? 'bg-blue-50 text-blue-700' : i < step ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            {errors.duplicate && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errors.duplicate}
              </div>
            )}
            {user?.role === 'consultant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to GC</label>
                <select value={selectedGcId} onChange={e => setSelectedGcId(e.target.value)} className={inputClasses('')}>
                  {availableGCs.map(gc => <option key={gc.id} value={gc.id}>{gc.company_name}</option>)}
                </select>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                <input value={companyData.company_name} onChange={e => handleCompanyChange('company_name', e.target.value)} className={inputClasses('company_name')} placeholder="Acme Electrical LLC" />
                {errors.company_name && <p className="text-xs text-red-600 mt-1">{errors.company_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name</label>
                <input value={companyData.contact_name} onChange={e => handleCompanyChange('contact_name', e.target.value)} className={inputClasses('contact_name')} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trade *</label>
                <select value={companyData.trade} onChange={e => handleCompanyChange('trade', e.target.value)} className={inputClasses('trade')}>
                  <option value="">Select trade...</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.trade && <p className="text-xs text-red-600 mt-1">{errors.trade}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={companyData.email} onChange={e => handleCompanyChange('email', e.target.value)} className={inputClasses('email')} placeholder="contact@company.com" />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" value={companyData.phone} onChange={e => handleCompanyChange('phone', e.target.value)} className={inputClasses('phone')} placeholder="(208) 555-0000" />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input value={companyData.address} onChange={e => handleCompanyChange('address', e.target.value)} className={inputClasses('address')} placeholder="123 Main St, Boise, ID 83702" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">EIN</label>
                <input value={companyData.ein} onChange={e => handleCompanyChange('ein', e.target.value)} className={inputClasses('ein')} placeholder="XX-XXXXXXX" />
                {errors.ein && <p className="text-xs text-red-600 mt-1">{errors.ein}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Entity Type</label>
                <select value={companyData.entity_type} onChange={e => handleCompanyChange('entity_type', e.target.value)} className={inputClasses('entity_type')}>
                  <option value="">Select...</option>
                  {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">W-9 Upload</h2>
            <p className="text-sm text-gray-500">Upload the subcontractor's current W-9 form (optional for now)</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              {w9Data.fileName ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{w9Data.fileName}</p>
                  <button onClick={() => setW9Data({ file: null, fileName: '' })} className="text-xs text-red-500 hover:text-red-600 mt-1">Remove</button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-2">Drag & drop a PDF file or click to browse</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" /> Choose File
                    <input type="file" accept=".pdf" onChange={handleW9Upload} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Insurance Agent</h2>
            <p className="text-sm text-gray-500">Enter the subcontractor's insurance agent details</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Agent Name *</label>
                <input value={agentData.name} onChange={e => handleAgentChange('name', e.target.value)} className={inputClasses('agent_name')} placeholder="Patricia Langford" />
                {errors.agent_name && <p className="text-xs text-red-600 mt-1">{errors.agent_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Agency Name *</label>
                <input value={agentData.agency} onChange={e => handleAgentChange('agency', e.target.value)} className={inputClasses('agent_agency')} placeholder="Langford Insurance Group" />
                {errors.agent_agency && <p className="text-xs text-red-600 mt-1">{errors.agent_agency}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Agent Email *</label>
                <input type="email" value={agentData.email} onChange={e => handleAgentChange('email', e.target.value)} className={inputClasses('agent_email')} placeholder="agent@insurance.com" />
                {errors.agent_email && <p className="text-xs text-red-600 mt-1">{errors.agent_email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Agent Phone</label>
                <input type="tel" value={agentData.phone} onChange={e => handleAgentChange('phone', e.target.value)} className={inputClasses('agent_phone')} placeholder="(208) 555-0000" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
            <div className="space-y-4">
              <ReviewSection title="Company" items={[
                ['Company Name', companyData.company_name],
                ['Contact', companyData.contact_name],
                ['Trade', companyData.trade],
                ['Email', companyData.email],
                ['Phone', companyData.phone],
                ['Address', companyData.address],
                ['EIN', companyData.ein],
                ['Entity Type', companyData.entity_type],
              ]} />
              <ReviewSection title="W-9" items={[
                ['File', w9Data.fileName || 'No file uploaded'],
              ]} />
              <ReviewSection title="Insurance Agent" items={[
                ['Name', agentData.name],
                ['Agency', agentData.agency],
                ['Email', agentData.email],
                ['Phone', agentData.phone],
              ]} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          {step > 0 ? (
            <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={handleNext} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <CheckCircle className="w-4 h-4" /> Add Subcontractor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, items }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map(([label, value]) => (
          <div key={label} className="flex gap-2 text-sm">
            <dt className="text-gray-400 shrink-0">{label}:</dt>
            <dd className="text-gray-700 font-medium">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
