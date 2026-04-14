import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getComplianceStats, formatPhone } from '../utils/compliance';
import StatusBadge from '../components/shared/StatusBadge';
import { Building2, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

export default function ContractorsList() {
  const { user } = useAuth();
  const { generalContractors } = useData();

  const myGCs = useMemo(() => {
    return generalContractors
      .filter(gc => gc.consultant_id === user?.consultant_id)
      .map(gc => ({ ...gc, stats: getComplianceStats(gc.id) }));
  }, [generalContractors, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">General Contractors</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your GC client portfolio</p>
      </div>

      <div className="grid gap-4">
        {myGCs.map(gc => {
          const status = gc.stats.red > 0 ? 'red' : gc.stats.yellow > 0 ? 'yellow' : 'green';
          return (
            <Link
              key={gc.id}
              to={`/contractors/${gc.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{gc.company_name}</h3>
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{gc.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{formatPhone(gc.phone)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gc.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{gc.stats.total}</p>
                    <p className="text-xs text-gray-400">Subs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{gc.stats.complianceRate}%</p>
                    <p className="text-xs text-gray-400">Compliant</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
