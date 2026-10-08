import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { NotificationItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  CheckCheck, 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { refreshNotifications } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const displayed = filterUnread
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'registration':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'approval':
        return <CheckCheck className="w-4 h-4 text-blue-600" />;
      case 'rejection':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'announcement':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated with event confirmations, forum notices, and schedule alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterUnread
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Filter Unread'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No notifications to display</p>
          <p className="text-slate-400 mt-1">You are all caught up with your college events!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                n.is_read
                  ? 'bg-white border-slate-200/70 hover:border-slate-300'
                  : 'bg-blue-50/40 border-blue-200/80 shadow-2xs'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${n.is_read ? 'text-slate-800' : 'text-blue-950'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
