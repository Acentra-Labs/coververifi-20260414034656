import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { getComplianceStatus, getComplianceStats, getDaysUntilExpiration, formatDate, formatCurrency } from '../utils/compliance';
import StatusBadge from '../components/shared/StatusBadge';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  UserPlus,
  Search,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default function ContractorDetail() {
  const { id } = useParams();
  const { generalContractors, getSubsForGC, certificates } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const gc = generalContractors.find(g => g.id === parseInt(id));
  const subs = useMemo(() => gc ? getSubsForGC(gc.id) : [], [gc, getSubsForGC]);
  const stats = useMemo(() => gc ? getComplianceStats(gc.id) : { green: 0, yellow: 0, red: 0, total: 0, complianceRate: 0 }, [gc]);

  const subsWithStatus = useMemo(() => {
    return subs.map(sub => {
      const status = getComplianceStatus(sub.id, gc);
      const subCerts = certificates.filter(c => c.subcontractor_id === sub.id);
      const glCert = subCerts.find(c => c.type === 'gl');
      const wcCert = subCerts.find(c => c.type === 'wc');
      return { ...sub, status, glCert, wcCert };
    }).filter(sub => {
      const matchesSearch = !search || sub.company_name.toLowerCase().includes(search.toLowerCase()) || sub.trade.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const order = { red: 0, yellow: 1, green: 2 };
      return order[a.status] - order[b.status];
    });
  }, [subs, gc, certificates, search, statusFilter]);

  if (!gc) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Contractor not found</p>
        <Link to="/contractors" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Back to contractors</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/contractors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Contractors
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{gc.company_name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              <span>{gc.contact_name}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{gc.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{gc.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{stats.complianceRate}%</p>
              <p className="text-xs text-emerald-700">Compliant</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Subs</p>
          </div>
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-emerald-600">{stats.green}</p>
            <p className="text-xs text-gray-500">Compliant</p>
          </div>
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-amber-600">{stats.yellow}</p>
            <p className="text-xs text-gray-500">At Risk</p>
          </div>
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-red-600">{stats.red}</p>
            <p className="text-xs text-gray-500">Non-Compliant</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1"><ShieldCheck className="w-3.5 h-3.5" /> Compliance Requirements</div>
          <p>GL: {formatCurrency(gc.gl_minimum_per_occurrence)} occ. / {formatCurrency(gc.gl_minimum_aggregate)} agg. | WC: {gc.wc_requirement} | Additional Insured: {gc.require_additional_insured ? 'Required' : 'Not Required'}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subcontractors..."
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
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <Link
          to="/add-subcontractor"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add Sub
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 sm:px-6 py-3">Company</th>
                <th className="px-4 py-3 hidden sm:table-cell">Trade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">GL Expiration</th>
                <th className="px-4 py-3 hidden md:table-cell">WC Expiration</th>
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
                  <td className="px-4 py-3"><StatusBadge status={sub.status} size="sm" /></td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">{sub.glCert ? formatDate(sub.glCert.expiration_date) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">{sub.wcCert ? formatDate(sub.wcCert.expiration_date) : '—'}</td>
                  <td className="px-4 py-3">
                    <Link to={`/subcontractors/${sub.id}`} className="text-blue-600 hover:text-blue-700"><ArrowRight className="w-4 h-4" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subsWithStatus.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-400">No subcontractors match your search</p>
        )}
      </div>
    </div>
  );
}
