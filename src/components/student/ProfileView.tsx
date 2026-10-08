import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/RoleBadge';
import { api } from '../../lib/api';
import { CollegeEvent, Forum } from '../../types';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  FileText, 
  Check, 
  Edit3, 
  Calendar,
  Users
} from 'lucide-react';

interface ProfileViewProps {
  onSelectEvent: (event: CollegeEvent) => void;
  onSelectForum: (forum: Forum) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onSelectEvent,
  onSelectForum,
}) => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const [registeredEvents, setRegisteredEvents] = useState<CollegeEvent[]>([]);
  const [joinedForums, setJoinedForums] = useState<Forum[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setDepartment(user.department || '');
      setYear(user.year || '');
      setBio(user.bio || '');
    }

    const loadUserData = async () => {
      try {
        const [evtsRes, forumsRes] = await Promise.all([
          api.getEvents({ filter: 'registered' }),
          api.getForums(),
        ]);
        setRegisteredEvents(evtsRes.events);
        setJoinedForums(forumsRes.forums.filter((f) => f.is_member));
      } catch (err) {
        console.error('Failed to load user associations:', err);
      }
    };
    loadUserData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateProfile({
        full_name: fullName,
        department,
        year,
        bio,
      });
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      alert((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-blue-100 text-blue-700 border-2 border-blue-200 flex items-center justify-center font-bold text-3xl overflow-hidden shadow-sm shrink-0">
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

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.full_name}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <RoleBadge role={user?.role || 'student'} />
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {user?.bio || 'Collegiate scholar exploring technical events and forums on UniForum.'}
            </p>

            {/* Quick Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>{user?.department || 'Department Not Specified'}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>{user?.year || 'Class of 2027'}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">ID: {user?.college_id}</span>
            </div>
          </div>
        </div>

        {/* Edit Form Modal/Drawer */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Registered Events Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Registered Events</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {registeredEvents.length} registrations
          </span>
        </div>

        {registeredEvents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">You have not registered for any events yet.</p>
        ) : (
          <div className="space-y-2">
            {registeredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{evt.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(evt.start_datetime).toLocaleDateString()} · {evt.location}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Confirmed ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Joined Forums Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Joined Forums & Clubs</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {joinedForums.length} memberships
          </span>
        </div>

        {joinedForums.length === 0 ? (
          <p className="text-xs text-slate-400 italic">You have not joined any campus clubs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {joinedForums.map((f) => (
              <div
                key={f.id}
                onClick={() => onSelectForum(f)}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  {f.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{f.name}</h4>
                  <p className="text-[11px] text-slate-500">{f.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
