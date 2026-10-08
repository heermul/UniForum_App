import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthModal } from './components/auth/AuthModal';
import { RoleSelectorModal } from './components/auth/RoleSelectorModal';

// Student views
import { StudentDashboard } from './components/student/StudentDashboard';
import { EventsView } from './components/student/EventsView';
import { ForumsView } from './components/student/ForumsView';
import { ForumFeedView } from './components/student/ForumFeedView';
import { NotificationsView } from './components/student/NotificationsView';
import { ProfileView } from './components/student/ProfileView';
import { EventDetailModal } from './components/student/EventDetailModal';

// Coordinator views
import { CoordinatorDashboard } from './components/coordinator/CoordinatorDashboard';

// Faculty views
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { EventCalendarView } from './components/faculty/EventCalendarView';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagementView } from './components/admin/UserManagementView';
import { ForumAdminView } from './components/admin/ForumAdminView';

// AI Assistant
import { AiChatbotModal } from './components/ai/AiChatbotModal';
import { CollegeEvent, Forum } from './types';
import { api } from './lib/api';
import { Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, role } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Sync activeTab when role changes
  React.useEffect(() => {
    if (role === 'student' && !['home', 'events', 'forums', 'feed', 'notifications', 'profile'].includes(activeTab)) {
      setActiveTab('home');
    } else if (role === 'coordinator' && !['dashboard', 'my-events', 'manage-forum', 'analytics'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (role === 'faculty' && !['approvals', 'calendar', 'moderation'].includes(activeTab)) {
      setActiveTab('approvals');
    } else if (role === 'admin' && !['admin-dashboard', 'user-management', 'all-events', 'forum-management'].includes(activeTab)) {
      setActiveTab('admin-dashboard');
    }
  }, [role]);

  const handleRegisterToggle = async (event: CollegeEvent) => {
    try {
      const res = await api.registerForEvent(event.id);
      // update local state
      setSelectedEvent((prev) => (prev && prev.id === event.id ? { ...prev, is_registered: res.is_registered } : prev));
    } catch (err: unknown) {
      alert((err as Error).message || 'Registration failed');
    }
  };

  const handleSelectForum = (forum: Forum) => {
    setSelectedForum(forum);
    setActiveTab('feed');
  };

  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />;
  }

  // Render role-specific content
  const renderContent = () => {
    if (role === 'coordinator') {
      switch (activeTab) {
        case 'manage-forum':
          return <ForumFeedView />;
        default:
          return <CoordinatorDashboard onSelectEvent={(e) => setSelectedEvent(e)} />;
      }
    }

    if (role === 'faculty') {
      switch (activeTab) {
        case 'calendar':
          return <EventCalendarView />;
        default:
          return <FacultyDashboard />;
      }
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'user-management':
          return <UserManagementView />;
        case 'forum-management':
          return <ForumAdminView />;
        case 'all-events':
          return <EventsView onSelectEvent={(e) => setSelectedEvent(e)} />;
        default:
          return <AdminDashboard />;
      }
    }

    // Default: Student role
    switch (activeTab) {
      case 'events':
        return <EventsView onSelectEvent={(e) => setSelectedEvent(e)} />;
      case 'forums':
        return <ForumsView onSelectForum={handleSelectForum} />;
      case 'feed':
        return <ForumFeedView selectedForumId={selectedForum?.id} />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return (
          <ProfileView
            onSelectEvent={(e) => setSelectedEvent(e)}
            onSelectForum={handleSelectForum}
          />
        );
      default:
        return (
          <StudentDashboard
            onSelectEvent={(e) => setSelectedEvent(e)}
            onSelectForum={handleSelectForum}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAiAssistant={() => setAiAssistantOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Desktop Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAssistant={() => setAiAssistantOpen(true)}
        onOpenNotifications={() => setActiveTab('notifications')}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* 2. Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderContent()}
      </main>

      {/* 3. Floating AI Assistant Action (Mobile/Desktop quick launcher) */}
      <button
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 p-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 flex items-center justify-center cursor-pointer"
        title="UniForum AI Campus Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* 4. Mobile Bottom Nav (<15% mobile viewport cap) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setActiveTab('notifications')}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onRegisterToggle={handleRegisterToggle}
      />

      <AiChatbotModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      <RoleSelectorModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onRoleSelected={(r) => {}}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
