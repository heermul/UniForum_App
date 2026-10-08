import React from 'react';
import { CollegeEvent } from '../../types';
import { EventBannerPlaceholder } from './EventBannerPlaceholder';
import { Calendar, MapPin, Users, CheckCircle2, Clock } from 'lucide-react';

interface EventCardProps {
  event: CollegeEvent;
  onSelect: (event: CollegeEvent) => void;
  onRegisterToggle?: (event: CollegeEvent) => void;
  isRegistering?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onRegisterToggle,
  isRegistering = false,
}) => {
  const startDate = new Date(event.start_datetime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const seatsRemaining = Math.max(0, event.capacity - (event.registered_count || 0));
  const isFull = seatsRemaining === 0;

  return (
    <div
      onClick={() => onSelect(event)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Banner */}
      <div className="relative">
        <EventBannerPlaceholder
          category={event.event_type}
          title={event.title}
          imageUrl={event.banner_image}
          className="h-36 sm:h-40"
        />
        {/* Floating status badge if not approved */}
        {event.status !== 'approved' && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md bg-amber-500/90 text-white shadow-sm">
            {event.status.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed metadata: Forum & Category */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span className="text-blue-600 font-semibold">{event.forum_name || 'Campus Forum'}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{event.event_type}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          {/* Description snippet */}
          <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Logistics metadata */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formattedDate} at {formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {seatsRemaining} seats left of {event.capacity}
              </span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            {event.status === 'approved' ? (
              <span className="inline-flex items-center text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-600 font-medium">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Pending Review
              </span>
            )}
          </div>

          {onRegisterToggle && event.status === 'approved' && (
            <div>
              {event.is_registered ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    ✓ Registered
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegisterToggle(event);
                    }}
                    disabled={isRegistering}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all disabled:opacity-50"
                  >
                    {isRegistering ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegisterToggle(event);
                  }}
                  disabled={isRegistering || isFull}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {isRegistering
                    ? 'Processing...'
                    : isFull
                    ? 'Fully Booked'
                    : 'Register Now'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};