import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { CollegeEvent, Forum, ForumPost, Recommendation } from '../../types';
import { EventCard } from '../common/EventCard';
import { SemanticSearchBar } from '../ai/SemanticSearchBar';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  ArrowRight, 
  MessageSquare, 
  Check, 
  Plus,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  onSelectEvent: (event: CollegeEvent) => void;
  onSelectForum: (forum: Forum) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAiAssistant: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectEvent,
  onSelectForum,
  onNavigateTab,
  onOpenAiAssistant,
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CollegeEvent[]>([]);
  const [popularForums, setPopularForums] = useState<Forum[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recsRes, eventsRes, forumsRes, postsRes] = await Promise.all([
        api.getRecommendations().catch(() => ({ recommendations: [] })),
        api.getEvents({ status: 'approved', filter: 'upcoming' }),
        api.getForums(),
        api.getPosts(),
      ]);

      setRecommendations(recsRes.recommendations || []);
      setUpcomingEvents(eventsRes.events.slice(0, 4));
      setPopularForums(forumsRes.forums.slice(0, 4));
      setRecentPosts(postsRes.posts.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleRegisterToggle = async (event: CollegeEvent) => {
    try {
      setRegisteringId(event.id);
      await api.registerForEvent(event.id);
      await loadDashboardData();
    } catch (err: unknown) {
      alert((err as Error).message || 'Registration failed');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleForumJoin = async (e: React.MouseEvent, forumId: string) => {
    e.stopPropagation();
    try {
      await api.toggleJoinForum(forumId);
      await loadDashboardData();
    } catch (err) {
      console.error('Join error:', err);
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Greeting & AI Search */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle background circles */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">
            <span>Welcome to UniForum</span>
            <span aria-hidden="true">·</span>
            <span>{user?.department || 'Computer Science'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Hi, {firstName} 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Discover campus hackathons, technical workshops, and forum discussions personalized for your degree.
          </p>

          {/* Search bar inside header */}
          <div className="mt-6">
            <SemanticSearchBar
              onSelectEvent={onSelectEvent}
              onSelectForum={onSelectForum}
            />
          </div>
        </div>
      </div>

      {/* 2. Recommended For You (AI-Powered) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500">AI-curated based on your department, clubs & registrations</p>
            </div>
          </div>
          <button
            onClick={onOpenAiAssistant}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Ask AI Assistant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 text-center text-xs text-slate-500">
            Join forums to unlock personalized AI event recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((rec) => {
              if (!rec.event) return null;
              return (
                <div key={rec.event_id} className="relative flex flex-col">
                  {/* AI Reason Badge / Text */}
                  <div className="mb-2 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border border-blue-100">
                    <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{rec.reason}</span>
                  </div>

                  <EventCard
                    event={rec.event}
                    onSelect={onSelectEvent}
                    onRegisterToggle={handleRegisterToggle}
                    isRegistering={registeringId === rec.event.id}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
              <p className="text-xs text-slate-500">Scheduled campus gatherings, workshops, and fests</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('events')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelect={onSelectEvent}
              onRegisterToggle={handleRegisterToggle}
              isRegistering={registeringId === evt.id}
            />
          ))}
        </div>
      </section>

      {/* 4. Popular Forums Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Popular Forums</h2>
              <p className="text-xs text-slate-500">Student clubs and collegiate societies</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('forums')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularForums.map((forum) => (
            <div
              key={forum.id}
              onClick={() => onSelectForum(forum)}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {forum.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {forum.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900">{forum.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {forum.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {forum.member_count} members
                </span>
                <button
                  onClick={(e) => handleForumJoin(e, forum.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    forum.is_member
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {forum.is_member ? 'Joined ✓' : '+ Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Forum Activity Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Forum Activity</h2>
              <p className="text-xs text-slate-500">Live conversations and announcements</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('feed')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Open Feed</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-blue-600">{post.forum_name}</span>
                  <span className="font-mono text-[11px]">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">{post.author_name}</span>
                <span className="font-mono">{post.comments_count} replies</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
