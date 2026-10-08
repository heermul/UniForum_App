import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'blue',
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">{value}</p>
        {change && (
          <p className={`mt-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
