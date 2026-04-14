import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getComplianceStatus, getDaysUntilExpiration, formatDate, getExpirationLabel } from '../utils/compliance';
import StatusBadge from '../components/shared/StatusBadge';
import EmptyState from '../components/shared/EmptyState';
import { Search, ArrowRight, UserPlus, Users } from 'lucide-react';

export default function SubcontractorsList() {
  const { user } = useAuth();
  const { subcontractors, generalContractors, gcSubs, certificates, getAgentForSub } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const visibleSubs = useMemo(() => {
    let subIds;
    if (user?.role === 'consultant') {
      const gcIds = generalContractors.filter(gc => gc.consultant_id === user.consultant_id).map(gc => gc.id);
      subIds = [...new Set(gcSubs.filter(gs => gcIds.includes(gs.gc_id)).map(gs => gs.subcontractor_id))];
    } else {
      subIds = gcSubs.filter(gs => gs.gc_id === user?.gc_id).map(gs => gs.subcontractor_id);
    }

    return subcontractors
      .filter(s => subIds.includes(s.id))
      .map(sub => {
        const status = getComplianceStatus(sub.id);
        const subCerts = certificates.filter(c => c.subcontractor_id === sub.id);
        const glCert = subCerts.find(c => c.type === 'gl');
        const wcCert = subCerts.find(c => c.type === 'wc');
        const agent = getAgentForSub(sub.id);
        return { ...sub, status, glCert, wcCert, agent };
      })
      .filter(sub => {
        const matchesSearch = !search ||
          sub.company_name.toLowerCase().includes(search.toLowerCase()) ||
          sub.trade.toLowerCase().includes(search.toLowerCase()) ||
          sub.contact_name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const order = { red: 0, yellow: 1, green: 2 };
        return order[a.status] - order[b.status];
      });
  }, [user, subcontractors, generalContractors, gcSubs, certificates, getAgentForSub, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcontractors</h1>
          <p className="text-sm text-gray-500 mt-1">{visibleSubs.length} subcontractors</p>
        </div>
        <Link
          to="/add-subcontractor"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add Subcontractor
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company, trade, or contact..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'green', 'yellow', 'red'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === f ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? `All (${visibleSubs.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {visibleSubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No subcontractors found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 sm:px-6 py-3">Company</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Trade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell">GL</th>
                  <th className="px-4 py-3 hidden lg:table-cell">WC</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Agent</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleSubs.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{sub.company_name}</p>
                      <p className="text-xs text-gray-500">{sub.contact_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{sub.trade}</td>
                    <td className="px-4 py-3"><StatusBadge status={sub.status} size="sm" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {sub.glCert ? (
                        <span className={`text-xs ${getDaysUntilExpiration(sub.glCert.expiration_date) < 0 ? 'text-red-600 font-medium' : getDaysUntilExpiration(sub.glCert.expiration_date) <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                          {getExpirationLabel(sub.glCert.expiration_date)}
                        </span>
                      ) : <span className="text-xs text-gray-400">Missing</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {sub.wcCert ? (
                        <span className={`text-xs ${getDaysUntilExpiration(sub.wcCert.expiration_date) < 0 ? 'text-red-600 font-medium' : getDaysUntilExpiration(sub.wcCert.expiration_date) <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                          {getExpirationLabel(sub.wcCert.expiration_date)}
                        </span>
                      ) : <span className="text-xs text-gray-400">Missing</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden xl:table-cell">{sub.agent?.name || '—'}</td>
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
      )}
    </div>
  );
}
