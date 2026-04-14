import { STATUS_CONFIG } from '../../utils/compliance';

export default function StatusBadge({ status, size = 'md', showLabel = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.red;
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showLabel && config.label}
    </span>
  );
}
