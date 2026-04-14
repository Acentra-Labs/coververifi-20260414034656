import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getComplianceStatus, getComplianceStats, getDaysUntilExpiration, formatDate } from '../utils/compliance';
import StatusBadge from '../components/shared/StatusBadge';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

export default function GCDashboard() {
  const { user } = useAuth();
  const { generalContractors, getSubsForGC, certificates } = useData();

  const gc = generalContractors.find(g => g.id === user?.gc_id);
  const subs = useMemo(() => gc ? getSubsForGC(gc.id) : [], [gc, getSubsForGC]);
  const stats = useMemo(() => gc ? getComplianceStats(gc.id) : { green: 0, yellow: 0, red: 0, total: 0, complianceRate: 0 }, [gc]);

  const subsWithStatus = useMemo(() => {
    return subs.map(sub => {
      const status = getComplianceStatus(sub.id, gc);
      const subCerts = certificates.filter(c => c.subcontractor_id === sub.id);
      const glCert = subCerts.find(c => c.type === 'gl');
      const wcCert = subCerts.find(c => c.type === 'wc');
      const glDays = glCert ? getDaysUntilExpiration(glCert.expiration_date) : null;
      const wcDays = wcCert ? getDaysUntilExpiration(wcCert.expiration_date) : null;
      return { ...sub, status, glCert, wcCert, glDays, wcDays };
    }).sort((a, b) => {
      const order = { red: 0, yellow: 1, green: 2 };
      return order[a.status] - order[b.status];
    });
  }, [subs, gc, certificates]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{gc?.company_name || 'Dashboard'}</h1>
          <p className="text-sm text-gray-500 mt-1">Subcontractor compliance overview</p>
        </div>
        <Link
          to="/add-subcontractor"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add Subcontractor
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Subs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{stats.green}</p>
          <p className="text-xs text-gray-500 mt-1">Compliant</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{stats.yellow}</p>
          <p className="text-xs text-gray-500 mt-1">At Risk</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{stats.red}</p>
          <p className="text-xs text-gray-500 mt-1">Non-Compliant</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Subcontractors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3">Company</th>
                <th className="px-4 py-3 hidden sm:table-cell">Trade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">GL Exp.</th>
                <th className="px-4 py-3 hidden md:table-cell">WC Exp.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subsWithStatus.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <p className="text-sm font-medium text-gray-900">{sub.company_name}</p>
                    <p className="text-xs text-gray-500 sm:hidden">{sub.trade}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{sub.trade}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {sub.glCert ? (
                      <span className={`text-xs font-medium ${sub.glDays < 0 ? 'text-red-600' : sub.glDays <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {formatDate(sub.glCert.expiration_date)}
                      </span>
                    ) : <span className="text-xs text-gray-400">No cert</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {sub.wcCert ? (
                      <span className={`text-xs font-medium ${sub.wcDays < 0 ? 'text-red-600' : sub.wcDays <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {formatDate(sub.wcCert.expiration_date)}
                      </span>
                    ) : <span className="text-xs text-gray-400">No cert</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/subcontractors/${sub.id}`} className="text-blue-600 hover:text-blue-700">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
