import React from 'react';
import { Home, Calendar, Users, MessageSquare, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const { unreadCount } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around h-14 max-h-[12vh]">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
          activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('events')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
          activeTab === 'events' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Events</span>
      </button>

      <button
        onClick={() => setActiveTab('forums')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
          activeTab === 'forums' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>Forums</span>
      </button>

      <button
        onClick={onOpenNotifications}
        className="relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <div className="relative">
          <Bell className="w-5 h-5 mb-0.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-blue-600 px-0.5 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span>Alerts</span>
      </button>

      <button
        onClick={onOpenProfile}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
          activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </button>
    </nav>
  );
};
