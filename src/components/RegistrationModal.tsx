import React, { useState } from 'react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess: (eventId: string, ticketId: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess
}) => {
  const [name, setName] = useState('Heer Mulchandani');
  const [prn, setPrn] = useState('23CS101');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: name, prnRoll: prn })
      });
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket_id);
        onSuccess(event.id, data.ticket_id);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (err) {
      alert('Network issue while connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
        <button 
          onClick={handleClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
        >
          ×
        </button>

        {!ticket ? (
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {event.forum_name || 'Campus Forum'}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-1">{event.title}</h3>
            <p className="text-xs text-gray-500 mb-5">📍 {event.location || 'Campus Main Hall'}</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">PRN / Roll Number</label>
                <input
                  type="text"
                  required
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow disabled:opacity-50 transition"
                >
                  {loading ? 'Submitting...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="text-lg font-bold text-gray-900">Registration Confirmed!</h4>
            <p className="text-xs text-gray-500">
              Entry ticket database mein generate ho chuka hai.
            </p>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200">
              <span className="text-[10px] text-gray-400 block font-mono">CONFIRMATION CODE</span>
              <span className="text-lg font-bold font-mono text-indigo-700">{ticket}</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};