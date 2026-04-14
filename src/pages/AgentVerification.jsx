import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { verificationRequests } from '../data/mockData';
import { subcontractors } from '../data/mockData';
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';

export default function AgentVerification() {
  const { token } = useParams();
  const [action, setAction] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState('');

  const request = useMemo(() => verificationRequests.find(v => v.token === token), [token]);
  const sub = useMemo(() => request ? subcontractors.find(s => s.id === request.subcontractor_id) : null, [request]);

  const isExpired = request && new Date(request.expires_at) < new Date();
  const isCompleted = request?.status === 'completed';

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (!request || !sub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-sm text-gray-500">This verification link is invalid or has been removed. Please contact the requesting party.</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-sm text-gray-500">This verification link has expired. Please contact the requesting party for a new link.</p>
        </div>
      </div>
    );
  }

  if (isCompleted || submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {submitted ? 'Response Submitted' : 'Already Completed'}
          </h1>
          <p className="text-sm text-gray-500">
            {submitted
              ? 'Thank you! Your response has been recorded. You may close this page.'
              : 'This verification request has already been completed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Shield className="w-7 h-7 text-cyan-500" />
            <span className="text-lg font-bold text-gray-900">CoverVerifi</span>
          </div>
          <p className="text-sm text-gray-500">Insurance Verification Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {request.type === 'certificate_request' ? 'Certificate Request' :
               request.type === 'verification' ? 'Policy Verification' : 'Expiration Reminder'}
            </h1>
            <p className="text-sm text-gray-500">
              Regarding <span className="font-semibold text-gray-900">{sub.company_name}</span>
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Subcontractor</p>
            <p className="text-sm font-medium text-gray-900">{sub.company_name}</p>
            <p className="text-xs text-gray-500">{sub.trade} — {sub.address}</p>
          </div>

          {!action ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Please select an action:</p>
              <button
                onClick={() => setAction('upload')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
                style={{ minHeight: '60px' }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upload Certificate</p>
                  <p className="text-xs text-gray-500">Upload a new or renewed insurance certificate</p>
                </div>
              </button>

              <button
                onClick={() => setAction('confirm')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
                style={{ minHeight: '60px' }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Confirm Policy Active</p>
                  <p className="text-xs text-gray-500">Confirm the current policy is still in effect</p>
                </div>
              </button>

              <button
                onClick={() => setAction('not_agent')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left"
                style={{ minHeight: '60px' }}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">No Longer Agent of Record</p>
                  <p className="text-xs text-gray-500">I no longer represent this subcontractor</p>
                </div>
              </button>
            </div>
          ) : action === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                {fileName ? (
                  <div>
                    <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">{fileName}</p>
                    <button onClick={() => setFileName('')} className="text-xs text-red-500 hover:text-red-600 mt-1">Remove</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Upload ACORD 25 certificate (PDF)</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors" style={{ minHeight: '44px' }}>
                      <Upload className="w-4 h-4" /> Choose File
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setAction(null); setFileName(''); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" style={{ minHeight: '44px' }}>
                  Back
                </button>
                <button onClick={handleSubmit} disabled={!fileName} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style={{ minHeight: '44px' }}>
                  Submit Certificate
                </button>
              </div>
            </div>
          ) : action === 'confirm' ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700">By clicking "Confirm," you attest that the insurance policy for <span className="font-semibold">{sub.company_name}</span> is currently active and in good standing.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAction(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" style={{ minHeight: '44px' }}>
                  Back
                </button>
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors" style={{ minHeight: '44px' }}>
                  Confirm Active
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700">You are indicating that you are no longer the insurance agent of record for <span className="font-semibold">{sub.company_name}</span>. The requesting party will be notified.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAction(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" style={{ minHeight: '44px' }}>
                  Back
                </button>
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors" style={{ minHeight: '44px' }}>
                  Confirm — No Longer Agent
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by CoverVerifi — Built by Acentra Labs
        </p>
      </div>
    </div>
  );
}
