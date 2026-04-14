import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getComplianceStats, getComplianceStatus, getDaysUntilExpiration, formatDate, STATUS_CONFIG } from '../utils/compliance';
import StatusBadge from '../components/shared/StatusBadge';
import {
  Building2,
  Users,
  AlertTriangle,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const { generalContractors, getSubsForGC, certificates } = useData();

  const myGCs = useMemo(() => {
    return generalContractors.filter(gc => gc.consultant_id === user?.consultant_id);
  }, [generalContractors, user]);

  const gcCards = useMemo(() => {
    return myGCs.map(gc => {
      const stats = getComplianceStats(gc.id);
      return { ...gc, stats };
    });
  }, [myGCs]);

  const totals = useMemo(() => {
    let totalSubs = 0, totalGreen = 0, totalYellow = 0, totalRed = 0;
    gcCards.forEach(gc => {
      totalSubs += gc.stats.total;
      totalGreen += gc.stats.green;
      totalYellow += gc.stats.yellow;
      totalRed += gc.stats.red;
    });
    const rate = totalSubs > 0 ? Math.round((totalGreen / totalSubs) * 100) : 0;
    return { totalSubs, totalGreen, totalYellow, totalRed, rate };
  }, [gcCards]);

  const actionItems = useMemo(() => {
    const items = [];
    myGCs.forEach(gc => {
      const subs = getSubsForGC(gc.id);
      subs.forEach(sub => {
        const subCerts = certificates.filter(c => c.subcontractor_id === sub.id);
        subCerts.forEach(cert => {
          const days = getDaysUntilExpiration(cert.expiration_date);
          if (days !== null && days < 0) {
            items.push({ type: 'expired', sub, gc, cert, days, priority: 0 });
          } else if (days !== null && days <= 30) {
            items.push({ type: 'expiring', sub, gc, cert, days, priority: 1 });
          }
          if (cert.ghost_policy_flag) {
            items.push({ type: 'ghost', sub, gc, cert, priority: 2 });
          }
        });
      });
    });
    return items.sort((a, b) => a.priority - b.priority || (a.days || 0) - (b.days || 0));
  }, [myGCs, getSubsForGC, certificates]);

  const statCards = [
    { label: 'GC Clients', value: myGCs.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Subs', value: totals.totalSubs, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Compliance Rate', value: `${totals.rate}%`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Action Items', value: actionItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-1">Here's your compliance portfolio overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">GC Clients</h2>
          <Link to="/contractors" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gcCards.map(gc => {
            const statusColor = gc.stats.red > 0 ? 'red' : gc.stats.yellow > 0 ? 'yellow' : 'green';
            return (
              <Link
                key={gc.id}
                to={`/contractors/${gc.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{gc.company_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{gc.contact_name}</p>
                  </div>
                  <StatusBadge status={statusColor} size="sm" />
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">{gc.stats.green}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-gray-600">{gc.stats.yellow}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-gray-600">{gc.stats.red}</span>
                  </div>
                </div>

                <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  {gc.stats.green > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${(gc.stats.green / gc.stats.total) * 100}%` }} />}
                  {gc.stats.yellow > 0 && <div className="bg-amber-500 h-full" style={{ width: `${(gc.stats.yellow / gc.stats.total) * 100}%` }} />}
                  {gc.stats.red > 0 && <div className="bg-red-500 h-full" style={{ width: `${(gc.stats.red / gc.stats.total) * 100}%` }} />}
                </div>
                <p className="text-xs text-gray-400 mt-2">{gc.stats.complianceRate}% compliant — {gc.stats.total} subcontractors</p>
              </Link>
            );
          })}
        </div>
      </div>

      {actionItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {actionItems.slice(0, 8).map((item, idx) => (
              <Link
                key={idx}
                to={`/subcontractors/${item.sub.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === 'expired' ? 'bg-red-50' : item.type === 'ghost' ? 'bg-amber-50' : 'bg-amber-50'
                }`}>
                  {item.type === 'expired' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : item.type === 'ghost' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.sub.company_name}</p>
                  <p className="text-xs text-gray-500">
                    {item.type === 'expired' && `${item.cert.type.toUpperCase()} expired ${Math.abs(item.days)}d ago`}
                    {item.type === 'expiring' && `${item.cert.type.toUpperCase()} expires in ${item.days}d`}
                    {item.type === 'ghost' && `${item.cert.type.toUpperCase()} ghost policy detected`}
                    {' — '}{item.gc.company_name}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
