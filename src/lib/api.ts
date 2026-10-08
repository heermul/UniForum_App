import { 
  UserProfile, 
  CollegeEvent, 
  Forum, 
  ForumPost, 
  PostComment, 
  NotificationItem, 
  AnalyticsStats, 
  Recommendation,
  AuditLog,
  EventRegistration
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  async getMe(): Promise<{ user: UserProfile }> {
    return fetchJson<{ user: UserProfile }>('/api/auth/me');
  },

  async switchRole(role: string, userId?: string): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJson<{ success: boolean; user: UserProfile }>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role, userId }),
    });
  },

  async login(email: string): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJson<{ success: boolean; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async signup(data: { full_name: string; email: string; department?: string; year?: string; role?: string }): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJson<{ success: boolean; user: UserProfile }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJson<{ success: boolean; user: UserProfile }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Events
  async getEvents(params?: { status?: string; category?: string; forum_id?: string; search?: string; filter?: string }): Promise<{ events: CollegeEvent[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.forum_id) query.set('forum_id', params.forum_id);
    if (params?.search) query.set('search', params.search);
    if (params?.filter) query.set('filter', params.filter);
    return fetchJson<{ events: CollegeEvent[] }>(`/api/events?${query.toString()}`);
  },

  async getEventById(id: string): Promise<{ event: CollegeEvent }> {
    return fetchJson<{ event: CollegeEvent }>(`/api/events/${id}`);
  },

  async createEvent(data: Partial<CollegeEvent>): Promise<{ success: boolean; event: CollegeEvent }> {
    return fetchJson<{ success: boolean; event: CollegeEvent }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async registerForEvent(id: string): Promise<{ success: boolean; is_registered: boolean; action: string }> {
    return fetchJson<{ success: boolean; is_registered: boolean; action: string }>(`/api/events/${id}/register`, {
      method: 'POST',
    });
  },

  async getEventAttendees(id: string): Promise<{ attendees: EventRegistration[] }> {
    return fetchJson<{ attendees: EventRegistration[] }>(`/api/events/${id}/attendees`);
  },

  // Forums
  async getForums(params?: { category?: string; search?: string }): Promise<{ forums: Forum[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    return fetchJson<{ forums: Forum[] }>(`/api/forums?${query.toString()}`);
  },

  async getForumById(id: string): Promise<{ forum: Forum }> {
    return fetchJson<{ forum: Forum }>(`/api/forums/${id}`);
  },

  async toggleJoinForum(id: string): Promise<{ success: boolean; is_member: boolean; action: string }> {
    return fetchJson<{ success: boolean; is_member: boolean; action: string }>(`/api/forums/${id}/join`, {
      method: 'POST',
    });
  },

  async toggleFollowForum(id: string): Promise<{ success: boolean; is_following: boolean; action: string }> {
    return fetchJson<{ success: boolean; is_following: boolean; action: string }>(`/api/forums/${id}/follow`, {
      method: 'POST',
    });
  },

  async createForum(data: { name: string; description: string; category: string; logo?: string }): Promise<{ success: boolean; forum: Forum }> {
    return fetchJson<{ success: boolean; forum: Forum }>('/api/forums', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Posts
  async getPosts(params?: { forum_id?: string }): Promise<{ posts: ForumPost[] }> {
    const query = new URLSearchParams();
    if (params?.forum_id) query.set('forum_id', params.forum_id);
    return fetchJson<{ posts: ForumPost[] }>(`/api/posts?${query.toString()}`);
  },

  async createPost(data: { forum_id: string; content: string; image_url?: string }): Promise<{ success: boolean; post: ForumPost }> {
    return fetchJson<{ success: boolean; post: ForumPost }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleLikePost(id: string): Promise<{ success: boolean; has_liked: boolean }> {
    return fetchJson<{ success: boolean; has_liked: boolean }>(`/api/posts/${id}/like`, {
      method: 'POST',
    });
  },

  async getComments(postId: string): Promise<{ comments: PostComment[] }> {
    return fetchJson<{ comments: PostComment[] }>(`/api/posts/${postId}/comments`);
  },

  async createComment(postId: string, content: string): Promise<{ success: boolean; comment: PostComment }> {
    return fetchJson<{ success: boolean; comment: PostComment }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Faculty Approvals
  async getPendingApprovals(): Promise<{ pending: CollegeEvent[] }> {
    return fetchJson<{ pending: CollegeEvent[] }>('/api/faculty/pending-approvals');
  },

  async reviewEvent(eventId: string, action: 'approve' | 'reject', remarks?: string): Promise<{ success: boolean; event: CollegeEvent }> {
    return fetchJson<{ success: boolean; event: CollegeEvent }>('/api/faculty/review-event', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, action, remarks }),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return fetchJson<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  // Admin
  async getAllUsers(): Promise<{ users: UserProfile[] }> {
    return fetchJson<{ users: UserProfile[] }>('/api/admin/users');
  },

  async changeUserRole(userId: string, role: string): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJson<{ success: boolean; user: UserProfile }>(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  async getAdminAnalytics(): Promise<{ stats: AnalyticsStats }> {
    return fetchJson<{ stats: AnalyticsStats }>('/api/admin/analytics');
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return fetchJson<{ logs: AuditLog[] }>('/api/admin/audit-logs');
  },

  // AI Features
  async getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    return fetchJson<{ recommendations: Recommendation[] }>('/api/ai/recommendations');
  },

  async autoTagEvent(title: string, description: string): Promise<{ success: boolean; category: string; tags: string[] }> {
    return fetchJson<{ success: boolean; category: string; tags: string[] }>('/api/ai/tag-event', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  async checkDuplicateEvent(data: { title: string; location?: string; start_datetime?: string }): Promise<{ isDuplicate: boolean; matchedEventTitle?: string; warning?: string }> {
    return fetchJson<{ isDuplicate: boolean; matchedEventTitle?: string; warning?: string }>('/api/ai/duplicate-check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async semanticSearch(query: string): Promise<{ events: CollegeEvent[]; forums: Forum[]; posts: ForumPost[] }> {
    return fetchJson<{ events: CollegeEvent[]; forums: Forum[]; posts: ForumPost[] }>(`/api/ai/semantic-search?q=${encodeURIComponent(query)}`);
  },

  async askAssistant(message: string): Promise<{ reply: string }> {
    return fetchJson<{ reply: string }>('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
