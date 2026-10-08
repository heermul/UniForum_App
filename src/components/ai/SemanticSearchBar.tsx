import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Calendar, Users, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { CollegeEvent, Forum, ForumPost } from '../../types';

interface SemanticSearchBarProps {
  onSelectEvent: (event: CollegeEvent) => void;
  onSelectForum: (forum: Forum) => void;
}

export const SemanticSearchBar: React.FC<SemanticSearchBarProps> = ({
  onSelectEvent,
  onSelectForum,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    events: CollegeEvent[];
    forums: Forum[];
    posts: ForumPost[];
  }>({ events: [], forums: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ events: [], forums: [], posts: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.semanticSearch(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.events.length > 0 || results.forums.length > 0 || results.posts.length > 0;

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search events, forums, topics... (e.g. 'coding competition this month')"
          className="w-full pl-10 pr-10 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-200/90 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs transition-all text-slate-900 placeholder:text-slate-400"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Sparkles className="absolute right-3.5 w-3.5 h-3.5 text-blue-500/70" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[420px] overflow-y-auto z-50 p-3 animate-in fade-in duration-100">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Analyzing semantic search across campus events...</span>
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching events or forums found for "{query}". Try checking upcoming categories.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Events ({results.events.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.events.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          onSelectEvent(e);
                          setIsOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{e.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{e.forum_name}</span>
                            <span>·</span>
                            <span>{new Date(e.start_datetime).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="capitalize">{e.event_type}</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forums Section */}
              {results.forums.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-t border-slate-100 pt-3">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Forums & Clubs ({results.forums.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.forums.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onSelectForum(f);
                          setIsOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{f.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{f.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {f.member_count} members
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-t border-slate-100 pt-3">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                    <span>Forum Discussions ({results.posts.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.posts.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-50/60 text-xs text-slate-700 line-clamp-2"
                      >
                        <span className="font-semibold text-slate-900">{p.author_name}: </span>
                        {p.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
