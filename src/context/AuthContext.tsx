import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface SignupData {
  full_name: string;
  email: string;
  department?: string;
  year?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'uniforum_auth_user';
const REGISTERED_USERS_KEY = 'uniforum_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>('student');
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        setUser(parsed);
        setRoleState(parsed.role || 'student');
      }
    } catch (err) {
      console.error('Failed to restore session', err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const registeredUsersRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: User[] = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
      const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      let loggedInUser: User;

      if (existingUser) {
        loggedInUser = existingUser;
      } else {
        let detectedRole: UserRole = 'student';
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('admin')) detectedRole = 'admin';
        else if (lowerEmail.includes('faculty') || lowerEmail.includes('prof')) detectedRole = 'faculty';
        else if (lowerEmail.includes('coord') || lowerEmail.includes('club')) detectedRole = 'coordinator';

        const username = email.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

        loggedInUser = {
          id: 'user_' + Date.now(),
          name: formattedName,
          email: email,
          role: detectedRole,
          department: 'Computer Science',
          year: '3rd Year',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          clubs: [],
        };
      }

      setUser(loggedInUser);
      setRoleState(loggedInUser.role);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    try {
      const newUser: User = {
        id: 'user_' + Date.now(),
        name: data.full_name,
        email: data.email,
        role: data.role,
        department: data.department || 'Computer Science',
        year: data.year || '1st Year',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.full_name.replace(/\s+/g, '')}`,
        clubs: [],
      };

      const registeredUsersRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: User[] = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
      registeredUsers.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

      setUser(newUser);
      setRoleState(newUser.role);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRoleState('student');
    localStorage.removeItem(STORAGE_KEY);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const updated: User = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout, setRole }}>
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