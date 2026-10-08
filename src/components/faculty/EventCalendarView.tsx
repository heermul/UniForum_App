import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CollegeEvent } from '../../types';
import { Calendar as CalendarIcon, MapPin, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export const EventCalendarView: React.FC = () => {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const res = await api.getEvents({ status: 'approved' });
        setEvents(res.events);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Venue conflict detection
  const findConflicts = (evt: CollegeEvent) => {
    const evtDate = evt.start_datetime.split('T')[0];
    return events.filter(
      (other) =>
        other.id !== evt.id &&
        other.location.toLowerCase() === evt.location.toLowerCase() &&
        other.start_datetime.split('T')[0] === evtDate
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Filter events for selected month & year (or within next 6 months for schedule)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Event Schedule & Calendar</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Campus-wide approved event schedules with automatic venue conflict monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Timeline Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          No approved events scheduled for this period.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((evt) => {
            const conflicts = findConflicts(evt);
            const hasConflict = conflicts.length > 0;
            const startDate = new Date(evt.start_datetime);

            return (
              <div
                key={evt.id}
                className={`p-5 rounded-2xl border transition-all bg-white ${
                  hasConflict
                    ? 'border-amber-300 shadow-xs ring-1 ring-amber-200'
                    : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Date badge */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {startDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-extrabold font-mono tabular-nums leading-none">
                        {startDate.getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="text-blue-600 font-bold">{evt.forum_name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{evt.event_type}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{evt.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.location}</span>
                        </span>
                        <span className="font-mono tabular-nums text-slate-600">
                          {evt.registered_count || 0}/{evt.capacity} seats filled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Notice or Status */}
                  <div className="sm:text-right shrink-0">
                    {hasConflict ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Venue Collision Detected ({conflicts[0].title})</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        No Schedule Conflicts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
