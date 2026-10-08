import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CollegeEvent, Forum } from '../../types';
import { StatCard } from '../common/StatCard';
import { CreateEventModal } from './CreateEventModal';
import { EventParticipantsModal } from './EventParticipantsModal';
import { 
  Calendar, 
  Users, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  BarChart3,
  ExternalLink,
  MapPin
} from 'lucide-react';

interface CoordinatorDashboardProps {
  onSelectEvent: (event: CollegeEvent) => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ onSelectEvent }) => {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<CollegeEvent | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evtsRes, forumsRes] = await Promise.all([
        api.getEvents(), // will return events created by this coordinator or approved
        api.getForums(),
      ]);
      setEvents(evtsRes.events);
      setForums(forumsRes.forums);
    } catch (err) {
      console.error('Failed to load coordinator data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => new Date(e.start_datetime) > new Date()).length;
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registered_count || 0), 0);
  const pendingApprovals = events.filter((e) => e.status === 'pending_approval').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Coordinator Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your student forum, submit events for faculty approval, and track participant rosters.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Managed Events"
          value={totalEvents}
          change="+2 from last month"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Upcoming Gatherings"
          value={upcomingEvents}
          change="Scheduled & active"
          icon={Clock}
          color="green"
        />
        <StatCard
          label="Total Registrations"
          value={totalRegistrations}
          change="Enrolled students"
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Pending Review"
          value={pendingApprovals}
          change={pendingApprovals > 0 ? 'Awaiting faculty' : 'All clear'}
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Events Table / Management list */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Organized Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live status, seat occupancy, and attendee tracking</p>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">{events.length} events</span>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
            No events created yet. Click "+ Create New Event" to propose your first club gathering!
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event & Category</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registrations</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((e) => {
                    const seatsLeft = e.capacity - (e.registered_count || 0);
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{e.title}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{e.event_type} · {e.forum_name}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {new Date(e.start_datetime).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">
                          {e.location}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                              e.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : e.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {e.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {e.status === 'rejected' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                            {e.status === 'pending_approval' && <Clock className="w-3 h-3 text-amber-600" />}
                            {e.status.replace('_', ' ')}
                          </span>
                          {e.rejection_reason && (
                            <p className="text-[10px] text-rose-600 mt-1 italic">
                              Reason: {e.rejection_reason}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                          <span className="font-bold">{e.registered_count || 0}</span> / {e.capacity}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEventForAttendees(e)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                              title="View registered attendees"
                            >
                              Attendees
                            </button>
                            <button
                              onClick={() => onSelectEvent(e)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                              title="Preview Event Card"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={loadData}
        forums={forums}
      />

      {/* Attendees Modal */}
      <EventParticipantsModal
        event={selectedEventForAttendees}
        isOpen={Boolean(selectedEventForAttendees)}
        onClose={() => setSelectedEventForAttendees(null)}
      />
    </div>
  );
};
