import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CollegeEvent } from '../../types';
import { EventBannerPlaceholder } from '../common/EventBannerPlaceholder';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  Bookmark,
  ShieldCheck
} from 'lucide-react';

interface EventDetailModalProps {
  event: CollegeEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterToggle: (event: CollegeEvent) => Promise<void>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegisterToggle,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);
  const deadline = new Date(event.registration_deadline);

  const formattedStart = startDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const formattedDeadline = deadline.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const seatsRemaining = Math.max(0, event.capacity - (event.registered_count || 0));
  const capacityPercent = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));
  const isFull = seatsRemaining === 0;

  const handleRegisterClick = async () => {
    try {
      setLoading(true);
      await onRegisterToggle(event);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      subtitle={`Organized by ${event.forum_name || 'Campus Forum'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <EventBannerPlaceholder
            category={event.event_type}
            title={event.title}
            imageUrl={event.banner_image}
            className="h-48 sm:h-56"
          />
        </div>

        {/* Status notice if not approved */}
        {event.status !== 'approved' && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pending Faculty Authorization</p>
              <p className="text-amber-700 mt-0.5">
                This event has been submitted by the coordinator and is currently under review by campus authorities.
              </p>
            </div>
          </div>
        )}

        {/* Quick Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Date & Time</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{formattedStart}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Venue / Location</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{event.location}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Registration Deadline</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{formattedDeadline}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3">
            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Capacity</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                {event.registered_count || 0} / {event.capacity} seats filled ({seatsRemaining} left)
              </p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About This Event</h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categories & Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag, i) => (
                <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {event.status === 'approved' ? (
              <button
                onClick={handleRegisterClick}
                disabled={loading || (isFull && !event.is_registered)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                  event.is_registered
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : isFull
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                {loading
                  ? 'Updating...'
                  : event.is_registered
                  ? '✓ You are Registered (Click to Cancel)'
                  : isFull
                  ? 'Registration Full'
                  : 'Register Now'}
              </button>
            ) : (
              <span className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                Registration opens upon faculty approval
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
