import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CollegeEvent } from '../../types';
import { EventCard } from '../common/EventCard';
import { Search, Calendar, CheckCircle2, History, SlidersHorizontal } from 'lucide-react';
import { RegistrationModal } from '../RegistrationModal';
import { CancelModal } from '../CancelModal';

interface EventsViewProps {
  onSelectEvent: (event: CollegeEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onSelectEvent }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'past'>('upcoming');
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'seats' | 'title'>('date');
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Dono modals ke liye alag state
  const [eventForRegisterModal, setEventForRegisterModal] = useState<CollegeEvent | null>(null);
  const [eventForCancelModal, setEventForCancelModal] = useState<CollegeEvent | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'competition', label: 'Competitions' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'sports', label: 'Sports' },
    { id: 'seminar', label: 'Seminars' },
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getEvents({
        status: 'approved',
        category: category !== 'all' ? category : undefined,
        search: search || undefined,
        filter: activeTab,
      });

      let sorted = [...res.events];
      if (sortBy === 'date') {
        sorted.sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
      } else if (sortBy === 'seats') {
        sorted.sort((a, b) => (b.capacity - b.registered_count) - (a.capacity - a.registered_count));
      } else if (sortBy === 'title') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      }

      setEvents(sorted);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeTab, category, sortBy, search]);

  const handleRegisterToggle = (event: CollegeEvent) => {
    if (event.is_registered) {
      // Agar already registered hai -> Confirmation modal kholo
      setEventForCancelModal(event);
    } else {
      // Agar register nahi hai -> Registration form modal kholo
      setEventForRegisterModal(event);
    }
  };

  const handleConfirmCancel = async (eventId: string) => {
    try {
      setRegisteringId(eventId);
      await api.registerForEvent(eventId); // backend par toggle hoke cancel karega
      await fetchEvents();
    } catch (err: unknown) {
      alert((err as Error).message || 'Error cancelling registration');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Events</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore, filter, and register for collegiate hackathons, competitions, and society workshops.
        </p>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Events</span>
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'registered'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Registered</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'past'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Past Archive</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, location..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'seats' | 'title')}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date (Earliest First)</option>
              <option value="seats">Available Seats</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'registered'
              ? 'You have not registered for any events yet. Check the upcoming tab to join hackathons and workshops!'
              : 'Try changing your category filters or search keywords.'}
          </p>
          {activeTab === 'registered' && (
            <button
              onClick={() => setActiveTab('upcoming')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
            >
              Browse Upcoming Events
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
              onRegisterToggle={handleRegisterToggle}
              isRegistering={registeringId === event.id}
            />
          ))}
        </div>
      )}

      {/* 1. Registration Form Modal */}
      <RegistrationModal
        isOpen={!!eventForRegisterModal}
        event={eventForRegisterModal}
        onClose={() => setEventForRegisterModal(null)}
        onSuccess={async () => {
          await fetchEvents();
        }}
      />

      {/* 2. Cancellation Confirmation Modal */}
      <CancelModal
        isOpen={!!eventForCancelModal}
        event={eventForCancelModal}
        onClose={() => setEventForCancelModal(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};