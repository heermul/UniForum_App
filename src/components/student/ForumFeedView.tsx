import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ForumPost, Forum, PostComment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/RoleBadge';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Sparkles, 
  Image as ImageIcon,
  Smile,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ForumFeedViewProps {
  selectedForumId?: string;
}

export const ForumFeedView: React.FC<ForumFeedViewProps> = ({ selectedForumId }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [activeForum, setActiveForum] = useState<string>(selectedForumId || 'all');
  const [newContent, setNewContent] = useState('');
  const [postForumId, setPostForumId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active expanded comments map
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, fRes] = await Promise.all([
        api.getPosts({ forum_id: activeForum !== 'all' ? activeForum : undefined }),
        api.getForums(),
      ]);
      setPosts(pRes.posts);
      setForums(fRes.forums);
      if (!postForumId && fRes.forums.length > 0) {
        setPostForumId(fRes.forums[0].id);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeForum]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      await api.createPost({
        forum_id: postForumId,
        content: newContent.trim(),
      });
      setNewContent('');
      await loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.toggleLikePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const hasLiked = !p.has_liked;
            const likesCount = hasLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
            return { ...p, has_liked: hasLiked, likes_count: likesCount };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isExpanded }));

    if (isExpanded && !commentsMap[postId]) {
      try {
        const res = await api.getComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
      const res = await api.createComment(postId, text);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));

      // Append comment
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.comment],
      }));

      // Update post comment count
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Forum Feed</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share announcements, team recruitment notices, and discuss club initiatives.
        </p>
      </div>

      {/* Filter by Forum */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveForum('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeForum === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          All Activity
        </button>
        {forums.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveForum(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeForum === f.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Post Composer Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">Create a Discussion Post</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Post to:</span>
              <select
                value={postForumId}
                onChange={(e) => setPostForumId(e.target.value)}
                className="text-xs font-semibold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 focus:outline-none"
              >
                {forums.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={`What's on your mind? Share hackathon updates, team formations, or ask questions...`}
            rows={3}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3" />
                AI Sentiment Monitored
              </span>
            </div>

            <button
              type="submit"
              disabled={!newContent.trim() || submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          No posts in this forum yet. Be the first to start a conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all"
            >
              {/* Author & Forum Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs overflow-hidden">
                    {post.author_avatar ? (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      post.author_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{post.author_name}</h4>
                      <RoleBadge role={post.author_role} size="sm" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-blue-600">{post.forum_name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sentiment Badge (Section 10.E) */}
                {post.sentiment && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      post.sentiment === 'positive'
                        ? 'bg-emerald-50 text-emerald-700'
                        : post.sentiment === 'negative'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {post.sentiment}
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.has_liked ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.has_liked ? 'fill-rose-600' : ''}`} />
                    <span className="font-mono tabular-nums">{post.likes_count}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-mono tabular-nums">{post.comments_count}</span>
                  </button>
                </div>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>{expandedComments[post.id] ? 'Hide Comments' : 'View Comments'}</span>
                  {expandedComments[post.id] ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Expandable Comments Drawer */}
              {expandedComments[post.id] && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  {/* Comments list */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(commentsMap[post.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No comments yet. Write the first response!</p>
                    ) : (
                      commentsMap[post.id].map((c) => (
                        <div key={c.id} className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">{c.author_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-normal">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      placeholder="Write a thoughtful comment..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim() || submittingComment[post.id]}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
