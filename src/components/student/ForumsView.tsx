import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Forum } from '../../types';
import { Users, Search, Bell, Check, Plus, ExternalLink, ShieldCheck } from 'lucide-react';

interface ForumsViewProps {
  onSelectForum: (forum: Forum) => void;
}

export const ForumsView: React.FC<ForumsViewProps> = ({ onSelectForum }) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Technical', 'Engineering', 'Cultural', 'Sports', 'Career'];

  const fetchForums = async () => {
    try {
      setLoading(true);
      const res = await api.getForums({
        category: category !== 'all' ? category : undefined,
        search: search || undefined,
      });
      setForums(res.forums);
    } catch (err) {
      console.error('Failed to load forums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, [category, search]);

  const handleJoinToggle = async (e: React.MouseEvent, forumId: string) => {
    e.stopPropagation();
    try {
      await api.toggleJoinForum(forumId);
      await fetchForums();
    } catch (err) {
      console.error('Failed to toggle join:', err);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent, forumId: string) => {
    e.stopPropagation();
    try {
      await api.toggleFollowForum(forumId);
      await fetchForums();
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">College Forums & Societies</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Join authorized student organizations, collaborate with peers, and stay informed on exclusive events.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forums, clubs by name..."
            className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {c === 'all' ? 'All Forums' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Forums Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : forums.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          No forums match your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {forums.map((forum) => (
            <div
              key={forum.id}
              onClick={() => onSelectForum(forum)}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {forum.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {forum.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Coord: {forum.coordinator_name}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {forum.category}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mt-2">
                  {forum.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  <span className="font-bold text-slate-800">{forum.member_count}</span> members
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleFollowToggle(e, forum.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      forum.is_following
                        ? 'border-blue-200 bg-blue-50 text-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title={forum.is_following ? 'Following club notifications' : 'Follow for updates'}
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleJoinToggle(e, forum.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      forum.is_member
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {forum.is_member ? 'Member ✓' : 'Join Forum'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
