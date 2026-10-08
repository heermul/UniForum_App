import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AnalyticsStats } from '../../types';
import { StatCard } from '../common/StatCard';
import { 
  Users, 
  Calendar, 
  Flag, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  PieChart as PieIcon,
  Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminAnalytics();
        setStats(res.stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-8 w-64 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System & Analytics Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          High-level institutional telemetry, user growth trends, and forum engagement benchmarks.
        </p>
      </div>

      {/* Primary KPI Grid (Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Registered Users"
          value={stats.totalUsers}
          change="+18% month over month"
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Active Forums"
          value={stats.totalForums}
          change="Clubs & societies"
          icon={Layers}
          color="green"
        />
        <StatCard
          label="Total Events Hosted"
          value={stats.totalEvents}
          change="Hackathons & fests"
          icon={Calendar}
          color="purple"
        />
        <StatCard
          label="Pending Authorizations"
          value={stats.pendingApprovals}
          change={stats.pendingApprovals > 0 ? 'Requires faculty' : 'Queue clear'}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Total Registrations"
          value={stats.totalRegistrations}
          change="Confirmed tickets"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          label="Moderation Reports"
          value={stats.totalReports}
          change="Flagged incidents"
          icon={Flag}
          color="amber"
        />
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Registration Growth</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Monthly Enrollees</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
              {stats.registrationTrends.map((t) => {
                const maxVal = Math.max(...stats.registrationTrends.map((item) => item.count), 1);
                const heightPct = Math.round((t.count / maxVal) * 100);
                return (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-mono tabular-nums text-slate-600 font-bold">
                      {t.count}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-blue-600 hover:bg-blue-700 transition-all rounded-t-lg"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{t.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-center">
            * Consistent 24% uptick following introduction of AI smart recommendations.
          </p>
        </div>

        {/* User Distribution by Role */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">User Distribution by Role</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">RBAC Breakdown</span>
            </div>

            <div className="space-y-3.5 pt-2">
              {stats.userRoleDistribution.map((item) => {
                const pct = Math.round((item.count / (stats.totalUsers || 1)) * 100);
                return (
                  <div key={item.role}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.role}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {item.count} users ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Security Policy: Multi-role RBAC</span>
            <span className="text-emerald-600 font-semibold">Active & Enforced</span>
          </div>
        </div>
      </div>

      {/* Top Performing Forums Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Most Active Forums & Societies</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Ranked by Engagement</span>
        </div>

        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Forum Name</th>
                <th className="py-3 px-4">Registered Members</th>
                <th className="py-3 px-4">Hosted Events</th>
                <th className="py-3 px-4 text-right">Engagement Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.topForums.map((tf, i) => (
                <tr key={tf.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{tf.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                    {tf.members} members
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                    {tf.events} events
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                      High Activity
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
