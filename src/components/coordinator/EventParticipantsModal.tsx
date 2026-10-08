import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import { CollegeEvent, EventRegistration } from '../../types';
import { Search, Download, Users, CheckCircle2, User, Clock } from 'lucide-react';

interface EventParticipantsModalProps {
  event: CollegeEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventParticipantsModal: React.FC<EventParticipantsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [attendees, setAttendees] = useState<EventRegistration[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!event || !isOpen) return;

    const loadAttendees = async () => {
      try {
        setLoading(true);
        const res = await api.getEventAttendees(event.id);
        setAttendees(res.attendees);
      } catch (err) {
        console.error('Failed to load attendees:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendees();
  }, [event, isOpen]);

  const filtered = attendees.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.user_name || '').toLowerCase().includes(q) ||
      (a.user_email || '').toLowerCase().includes(q) ||
      (a.user_department || '').toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (!event || attendees.length === 0) return;
    const headers = ['Registration ID', 'Student Name', 'Email', 'Department', 'Status', 'Registered At'];
    const rows = attendees.map((a) => [
      a.id,
      `"${a.user_name || 'Student'}"`,
      `"${a.user_email || ''}"`,
      `"${a.user_department || ''}"`,
      a.registration_status,
      a.registered_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Attendees — ${event.title}`}
      subtitle={`${attendees.length} registered of ${event.capacity} total seats`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendee by name, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={exportCsv}
            disabled={attendees.length === 0}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster (CSV)</span>
          </button>
        </div>

        {/* Attendees Table */}
        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
            No attendees matching your search.
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                          {(att.user_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{att.user_name || 'Student'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{att.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {att.user_department || 'Engineering'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(att.registered_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
