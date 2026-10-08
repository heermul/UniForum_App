import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { 
  Bell, 
  Sparkles, 
  ChevronDown, 
  UserCheck, 
  LogOut, 
  Check, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiAssistant: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAssistant,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const { user, role, switchRole, unreadCount, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'student', label: 'Student', desc: 'Discover, register & participate' },
    { role: 'coordinator', label: 'Forum Coordinator', desc: 'Create events & manage clubs' },
    { role: 'faculty', label: 'Faculty / Authority', desc: 'Review & approve event submissions' },
    { role: 'admin', label: 'Administrator', desc: 'System analytics & user control' },
  ];

  const handleRoleSelect = async (r: UserRole) => {
    setRoleMenuOpen(false);
    await switchRole(r);
  };

  // Nav links depending on current user role
  const getNavLinks = () => {
    switch (role) {
      case 'coordinator':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'my-events', label: 'My Events' },
          { id: 'manage-forum', label: 'Forum & Feed' },
          { id: 'analytics', label: 'Analytics' },
        ];
      case 'faculty':
        return [
          { id: 'approvals', label: 'Pending Approvals' },
          { id: 'calendar', label: 'Event Schedule' },
          { id: 'moderation', label: 'Moderation Reports' },
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Analytics' },
          { id: 'user-management', label: 'Users' },
          { id: 'all-events', label: 'All Events' },
          { id: 'forum-management', label: 'Forums' },
        ];
      default:
        return [
          { id: 'home', label: 'Home' },
          { id: 'events', label: 'Events' },
          { id: 'forums', label: 'Forums' },
          { id: 'feed', label: 'Campus Feed' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* ZONE 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(role === 'student' ? 'home' : 'dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              U
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                UniForum
              </span>
            </div>
          </button>
        </div>

        {/* ZONE 2: Clean Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`text-sm font-semibold transition-colors relative py-1 ${
                activeTab === link.id
                  ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* ZONE 3: Primary Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:shadow hover:brightness-105 transition-all"
            title="Ask UniForum AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 transition-all text-xs"
              title="Switch demo role to test role-specific workflows"
            >
              <div className="hidden sm:block text-left pl-1">
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Demo Role</span>
                <span className="font-semibold text-slate-800 capitalize">{role}</span>
              </div>
              <RoleBadge role={role} size="sm" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">Switch Application Role</p>
                  <p className="text-[11px] text-slate-500">Test UniForum with 4 distinct permission flows</p>
                </div>
                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => handleRoleSelect(item.role)}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      role === item.role ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      <RoleBadge role={item.role} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        {role === item.role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs overflow-hidden">
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user.full_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.full_name?.charAt(0) || 'U'
              )}
            </div>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                activeTab === link.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenAiAssistant();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 rounded-xl bg-blue-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>UniForum AI Assistant</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
