import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onConfirm: (eventId: string) => Promise<void>;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  event,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !event) return null;

  const handleCancelRegistration = async () => {
    try {
      setLoading(true);
      await onConfirm(event.id);
      onClose();
    } catch (err) {
      alert('Failed to cancel registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Cancel Registration?
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to cancel your seat for{' '}
          <span className="font-semibold text-slate-700">"{event.title}"</span>? Your ticket will be released to other participants.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Keep Seat
          </button>
          <button
            type="button"
            onClick={handleCancelRegistration}
            disabled={loading}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel RSVP'}
          </button>
        </div>
      </div>
    </div>
  );
};