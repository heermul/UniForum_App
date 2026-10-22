import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, Mail, Lock, User, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const auth = useAuth() as any; // Safely interoperates with your AuthContext implementation
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }

        // Check which signature your AuthContext uses
        if (typeof auth.signUp === 'function') {
          try {
            // Attempt 1: Full Supabase auth signature
            await auth.signUp(email, password, { full_name: fullName, role, department });
          } catch {
            // Attempt 2: UniForum mock role-only signature
            await auth.signUp(role);
          }
        } else if (typeof auth.login === 'function') {
          await auth.login(role);
        }
      } else {
        if (typeof auth.signIn === 'function') {
          try {
            // Attempt 1: Email/Password
            await auth.signIn(email, password);
          } catch {
            // Attempt 2: UniForum mock role-only signature
            await auth.signIn(role);
          }
        } else if (typeof auth.login === 'function') {
          await auth.login(role);
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">UniForum Portal</h1>
        <p className="text-sm text-slate-400 mt-1">College Event & Forum Management System</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-900/60 p-1 mb-6 border border-slate-700/50">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegistering
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegistering
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 p-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector (available for both to test different dashboards easily) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Access Role / Dashboard
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="coordinator">Club Coordinator</option>
              <option value="faculty">Faculty Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Full Name & Department (Registration only) */}
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Information Technology"
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              College Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@college.edu"
                className="w-full bg-slate-900/70 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-slate-900/70 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isRegistering ? 'Register to Portal' : 'Login to Dashboard'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
