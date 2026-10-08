import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  loading: boolean;
  unreadCount: number;
  login: (email: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; department?: string; year?: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole, targetUserId?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCurrent = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      setUser(res.user);
      await fetchUnreadNotifs();
    } catch (err) {
      console.error('Failed to load current session:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifs = async () => {
    try {
      const res = await api.getNotifications();
      const count = res.notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const login = async (email: string) => {
    const res = await api.login(email);
    setUser(res.user);
    await fetchUnreadNotifs();
  };

  const signup = async (data: { full_name: string; email: string; department?: string; year?: string; role?: string }) => {
    const res = await api.signup(data);
    setUser(res.user);
    await fetchUnreadNotifs();
  };

  const logout = () => {
    // Switch to guest/default student
    login('heermulchandani2005@gmail.com');
  };

  const switchRole = async (newRole: UserRole, targetUserId?: string) => {
    const res = await api.switchRole(newRole, targetUserId);
    setUser(res.user);
    await fetchUnreadNotifs();
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        loading,
        unreadCount,
        login,
        signup,
        logout,
        switchRole,
        refreshUser,
        refreshNotifications: fetchUnreadNotifs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
