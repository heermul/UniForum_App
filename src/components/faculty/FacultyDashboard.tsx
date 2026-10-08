import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CollegeEvent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  AlertTriangle, 
  FileText,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingEvents, setPendingEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingEvent, setReviewingEvent] = useState<CollegeEvent | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.getPendingApprovals();
      setPendingEvents(res.pending);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (event: CollegeEvent) => {
    try {
      setSubmittingAction(true);
      await api.reviewEvent(event.id, 'approve');
      await fetchPending();
    } catch (err) {
      alert((err as Error).message || 'Failed to approve event');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenReject = (event: CollegeEvent) => {
    setReviewingEvent(event);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingEvent || !rejectReason.trim()) return;

    try {
      setSubmittingAction(true);
      await api.reviewEvent(reviewingEvent.id, 'reject', rejectReason.trim());
      setRejectModalOpen(false);
      setReviewingEvent(null);
      await fetchPending();
    } catch (err) {
      alert((err as Error).message || 'Failed to reject event');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Approvals & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review submitted student events, verify venue availability, and authorize public registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold font-mono tabular-nums">
            {pendingEvents.length} Awaiting Review
          </span>
        </div>
      </div>

      {/* Pending Events Queue */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : pendingEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">All submissions reviewed</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are currently no events pending faculty authorization. New coordinator submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all hover:border-slate-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Event Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="text-blue-600 font-bold">{evt.forum_name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{evt.event_type}</span>
                    <span aria-hidden="true">·</span>
                    <span>Submitted by {evt.creator_name || 'Coordinator'}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(evt.start_datetime).toLocaleDateString()} at {new Date(evt.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono tabular-nums">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Capacity: {evt.capacity} students</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: APPROVE / REJECT */}
                <div className="flex items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => handleOpenReject(evt)}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>REJECT</span>
                  </button>

                  <button
                    onClick={() => handleApprove(evt)}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPROVE</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Event Proposal"
        subtitle={reviewingEvent ? `For: ${reviewingEvent.title}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rejection Reason & Required Modifications *
            </label>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this event cannot be approved in its current form (e.g. Auditorium already reserved, safety precautions missing, or conflicting examination dates)..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rejectReason.trim() || submittingAction}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              {submittingAction ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
